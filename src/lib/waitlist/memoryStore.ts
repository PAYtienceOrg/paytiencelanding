import { ReferralCodeConflictError } from "./store";
import type { JoinWaitlistInput, JoinWaitlistResult, WaitlistStore } from "./store";

export class MemoryWaitlistStore implements WaitlistStore {
  private readonly entries: JoinWaitlistInput[] = [];

  async join(input: JoinWaitlistInput): Promise<JoinWaitlistResult> {
    const existing = this.entries.findIndex((entry) => entry.email === input.email);
    if (existing !== -1) {
      return {
        created: false,
        position: existing + 1,
        referralCode: this.entries[existing].referralCode,
        total: this.entries.length,
      };
    }
    if (this.entries.some((entry) => entry.referralCode === input.referralCode)) {
      throw new ReferralCodeConflictError();
    }

    // No await between reads and writes: concurrent calls cannot interleave.
    const inviter = this.entries.findIndex((entry) => entry.referralCode === input.ref);
    this.entries.push({ ...input });
    if (inviter > 0) {
      const [entry] = this.entries.splice(inviter, 1);
      this.entries.splice(Math.max(0, inviter - 5), 0, entry);
    }
    return {
      created: true,
      position: this.entries.length,
      referralCode: input.referralCode,
      total: this.entries.length,
    };
  }

  async count(): Promise<number> {
    return this.entries.length;
  }
}
