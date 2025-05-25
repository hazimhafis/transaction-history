import { Transaction, TransactionListResponse, AppError } from '../types/transaction';
import { mockTransactions } from '../data/mockTransactions';

export class TransactionService {
  private static instance: TransactionService;
  private transactions: Transaction[] = [];

  private constructor() {
    this.transactions = [...mockTransactions];
  }

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  async getTransactions(page: number = 1, limit: number = 20): Promise<TransactionListResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Sort transactions by date (newest first)
      const sortedTransactions = [...this.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

      return {
        transactions: paginatedTransactions,
        total: this.transactions.length,
        page,
        hasMore: endIndex < this.transactions.length,
      };
    } catch (error) {
      throw new AppError({
        code: 'FETCH_TRANSACTIONS_FAILED',
        message: 'Failed to fetch transactions',
        details: error,
      });
    }
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const transaction = this.transactions.find(t => t.id === id);
      return transaction || null;
    } catch (error) {
      throw new AppError({
        code: 'FETCH_TRANSACTION_FAILED',
        message: 'Failed to fetch transaction details',
        details: error,
      });
    }
  }

  async refreshTransactions(): Promise<TransactionListResponse> {
    try {
      // Simulate network delay for refresh
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would fetch fresh data from the server
      // For now, we'll just return the existing data
      return this.getTransactions(1, 20);
    } catch (error) {
      throw new AppError({
        code: 'REFRESH_TRANSACTIONS_FAILED',
        message: 'Failed to refresh transactions',
        details: error,
      });
    }
  }

  async searchTransactions(query: string): Promise<Transaction[]> {
    try {
      if (!query.trim()) {
        return [];
      }

      const lowercaseQuery = query.toLowerCase();
      
      return this.transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(lowercaseQuery) ||
        transaction.merchant?.toLowerCase().includes(lowercaseQuery) ||
        transaction.category.toLowerCase().includes(lowercaseQuery) ||
        transaction.amount.toString().includes(query)
      );
    } catch (error) {
      throw new AppError({
        code: 'SEARCH_TRANSACTIONS_FAILED',
        message: 'Failed to search transactions',
        details: error,
      });
    }
  }

  formatAmount(amount: number): string {
    const absAmount = Math.abs(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(absAmount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  getTransactionIcon(category: string): string {
    const iconMap: Record<string, string> = {
      grocery: '🛒',
      restaurant: '🍽️',
      gas: '⛽',
      shopping: '🛍️',
      entertainment: '🎬',
      utilities: '🏠',
      healthcare: '🏥',
      education: '📚',
      travel: '✈️',
      transfer: '💸',
      salary: '💰',
      investment: '📈',
      other: '💳',
    };
    
    return iconMap[category] || '💳';
  }
} 