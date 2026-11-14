import { MongoClient, MongoServerError } from "mongodb";
import type { Collection, Db } from "mongodb";
import { ReferralCodeConflictError } from "./store";
import type { JoinWaitlistInput, JoinWaitlistResult, WaitlistStore } from "./store";

interface EntryDocument {
  _id: string; // normalized email
  referralCode: string;
  position: number;
}

interface LockDocument {
  _id: "lock";
  version: number;
}

// Driver messages can quote document values (such as an email in a duplicate-key
// error), so only the error type and code are passed on to the server log.
function storageError(operation: string, error: unknown): Error {
  const name = error instanceof Error ? error.name : "unknown error";
  const code = error instanceof MongoServerError ? `, code ${error.code}` : "";
  return new Error(`Waitlist storage request failed (${operation}, ${name}${code}).`);
}

export class MongoWaitlistStore implements WaitlistStore {
  private readonly client: MongoClient;
  private readonly db: Db;
  private ready?: Promise<void>;

  // The constructor does not connect: the driver connects on the first operation.
  constructor(uri: string, dbName = "paytience") {
    this.client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 10_000,
    });
    this.db = this.client.db(dbName);
  }

  private get entries(): Collection<EntryDocument> {
    return this.db.collection<EntryDocument>("waitlist_entries");
  }

  private get meta(): Collection<LockDocument> {
    return this.db.collection<LockDocument>("waitlist_meta");
  }

  // Indexes and the lock document are created once, outside any transaction.
  private setup(): Promise<void> {
    this.ready ??= (async () => {
      await this.entries.createIndex({ referralCode: 1 }, { unique: true });
      await this.entries.createIndex({ position: 1 });
      // Two instances starting at once can race on this upsert; the loser sees 11000.
      await this.meta.updateOne({ _id: "lock" }, { $setOnInsert: { version: 0 } }, { upsert: true })
        .catch((error: unknown) => {
          if (!(error instanceof MongoServerError && error.code === 11000)) throw error;
        });
    })().catch((error: unknown) => {
      this.ready = undefined;
      throw error;
    });
    return this.ready;
  }

  async join(input: JoinWaitlistInput): Promise<JoinWaitlistResult> {
    await this.setup();
    const session = this.client.startSession();
    try {
      return await session.withTransaction(async () => {
        // Every join writes the same lock document first, so concurrent joins
        // conflict and the driver retries them one after another.
        await this.meta.updateOne({ _id: "lock" }, { $inc: { version: 1 } }, { session });
        const total = await this.entries.countDocuments({}, { session });
        const existing = await this.entries.findOne({ _id: input.email }, { session });
        if (existing) {
          return { created: false, position: existing.position, referralCode: existing.referralCode, total };
        }

        // Look up the inviter before insertion to exclude self-referrals.
        const inviter = input.ref
          ? await this.entries.findOne({ referralCode: input.ref }, { session })
          : null;
        await this.entries.insertOne(
          { _id: input.email, referralCode: input.referralCode, position: total + 1 },
          { session },
        );

        if (inviter && inviter.position > 1) {
          const target = Math.max(1, inviter.position - 5);
          await this.entries.updateMany(
            { position: { $gte: target, $lt: inviter.position } },
            { $inc: { position: 1 } },
            { session },
          );
          await this.entries.updateOne({ _id: inviter._id }, { $set: { position: target } }, { session });
        }
        return { created: true, position: total + 1, referralCode: input.referralCode, total: total + 1 };
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000 && error.keyPattern?.referralCode) {
        throw new ReferralCodeConflictError();
      }
      throw storageError("join", error);
    } finally {
      await session.endSession();
    }
  }

  async count(): Promise<number> {
    try {
      return await this.entries.countDocuments({});
    } catch (error) {
      throw storageError("count", error);
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
