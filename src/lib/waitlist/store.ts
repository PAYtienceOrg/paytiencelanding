export interface WaitlistData {
  position: number;
  referralCode: string;
  total: number;
}

export interface JoinWaitlistInput {
  email: string;
  referralCode: string;
  ref?: string;
}

export interface JoinWaitlistResult extends WaitlistData {
  created: boolean;
}

export class ReferralCodeConflictError extends Error {
  constructor() {
    super("Referral code already exists.");
  }
}

export interface WaitlistStore {
  // Atomically deduplicate, append, and move a valid inviter up five positions.
  join(input: JoinWaitlistInput): Promise<JoinWaitlistResult>;
  count(): Promise<number>;
}
