export type TransactionType = 'debit' | 'credit';

export type TransactionCategory = 
  | 'grocery'
  | 'restaurant'
  | 'gas'
  | 'shopping'
  | 'entertainment'
  | 'utilities'
  | 'healthcare'
  | 'education'
  | 'travel'
  | 'transfer'
  | 'salary'
  | 'investment'
  | 'other';

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  category: TransactionCategory;
  merchant?: string;
  location?: string;
  reference?: string;
  balance?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface AuthenticationState {
  isAuthenticated: boolean;
  isBiometricEnabled: boolean;
  lastAuthTime?: number;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor({ code, message, details }: { code: string; message: string; details?: any }) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}