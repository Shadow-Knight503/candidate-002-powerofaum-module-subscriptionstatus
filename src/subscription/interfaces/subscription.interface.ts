export interface Subscription {
  userId: string;
  plan: string;
  status: 'active' | 'inactive';
  expiresAt?: string;
  effectiveDate?: string;
}
