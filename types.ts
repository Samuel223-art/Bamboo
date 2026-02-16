
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'commission';
export type DealStatus = 'active' | 'completed' | 'cancelled' | 'disputed' | 'pending_acceptance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  accountNumber: string;
  phoneNumber?: string;
  country?: string;
  address?: string;
  bankName: string;
  balance: number;
  escrowBalance: number;
  kycStatus: 'verified' | 'pending' | 'unverified';
  transactionPin?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
  recipient?: string;
  recipientEmail?: string;
  sender?: string;
  senderEmail?: string;
  description: string;
}

export interface Deal {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  title: string;
  amount: number;
  commission: number;
  status: DealStatus;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyEmail: string;
  dateCreated: string;
  description: string;
  task: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  date: string;
}

export interface Contact {
    name: string;
    email: string;
    avatar: string;
}

export interface ActivityData {
    day: string;
    date: string;
    income: number;
    expense: number;
}
