
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  vpa: string;
  balance: number;
  joinedAt: number;
  pin?: string; // 4 digit secure PIN
}

export interface Transaction {
  id: string;
  amount: number;
  timestamp: number;
  type: 'debit' | 'credit';
  status: 'completed' | 'failed' | 'pending';
  fromVpa: string;
  toVpa: string;
  fromName: string;
  toName: string;
  note?: string;
  category?: 'Food' | 'Shopping' | 'Bills' | 'Travel' | 'Other';
}

export interface Reward {
  id: string;
  type: 'scratch_card';
  status: 'locked' | 'scratched';
  amount?: number;
  timestamp: number;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
}
