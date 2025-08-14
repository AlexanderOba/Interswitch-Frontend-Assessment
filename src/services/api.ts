interface Account {
  id: string;
  type: 'Savings' | 'Current' | 'Loan';
  accountNumber: string;
  balance: number;
  currency: string;
  lastTransactionDate: string;
  status: 'Active' | 'Inactive';
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  category: string;
  reference: string;
}

interface TransferRequest {
  sourceAccountId: string;
  beneficiaryAccount: string;
  amount: number;
  description: string;
}

interface TransferResponse {
  id: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
}

// Mock data
const mockAccounts: Account[] = [
  {
    id: '1',
    type: 'Savings',
    accountNumber: '1234567890',
    balance: 15420.50,
    currency: 'USD',
    lastTransactionDate: '2024-01-15T10:30:00Z',
    status: 'Active'
  },
  {
    id: '2',
    type: 'Current',
    accountNumber: '1234567891',
    balance: 8750.25,
    currency: 'USD',
    lastTransactionDate: '2024-01-14T14:20:00Z',
    status: 'Active'
  },
  {
    id: '3',
    type: 'Loan',
    accountNumber: '1234567892',
    balance: -45000.00,
    currency: 'USD',
    lastTransactionDate: '2024-01-10T09:15:00Z',
    status: 'Active'
  }
];

const generateTransactions = (accountId: string): Transaction[] => {
  const transactions: Transaction[] = [];
  let currentBalance = mockAccounts.find(acc => acc.id === accountId)?.balance || 0;
  
  for (let i = 0; i < 50; i++) {
    const isCredit = Math.random() > 0.6;
    const amount = Math.floor(Math.random() * 1000) + 10;
    const adjustedAmount = isCredit ? amount : -amount;
    
    currentBalance -= adjustedAmount;
    
    transactions.push({
      id: `txn-${accountId}-${i}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      description: isCredit ? 
        ['Salary Credit', 'Interest Credit', 'Refund', 'Transfer In'][Math.floor(Math.random() * 4)] :
        ['ATM Withdrawal', 'Online Purchase', 'Bill Payment', 'Transfer Out'][Math.floor(Math.random() * 4)],
      type: isCredit ? 'credit' : 'debit',
      amount: Math.abs(adjustedAmount),
      balanceAfter: currentBalance + adjustedAmount,
      category: isCredit ? 'Income' : 'Expense',
      reference: `REF${Date.now()}${i}`
    });
  }
  
  return transactions.reverse();
};

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async getAccounts(): Promise<Account[]> {
    await delay(500);
    return mockAccounts;
  },

  async getAccount(id: string): Promise<Account | null> {
    await delay(300);
    return mockAccounts.find(acc => acc.id === id) || null;
  },

  async getTransactions(accountId: string, page = 1, limit = 20): Promise<{ 
    transactions: Transaction[], 
    total: number, 
    hasMore: boolean 
  }> {
    await delay(400);
    const allTransactions = generateTransactions(accountId);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const transactions = allTransactions.slice(startIndex, endIndex);
    
    return {
      transactions,
      total: allTransactions.length,
      hasMore: endIndex < allTransactions.length
    };
  },

  async initiateTransfer(transfer: TransferRequest): Promise<TransferResponse> {
    await delay(1000);
    
    // Mock validation
    if (transfer.amount <= 0) {
      return {
        id: '',
        status: 'failed',
        message: 'Invalid amount'
      };
    }
    
    if (transfer.beneficiaryAccount.length < 10) {
      return {
        id: '',
        status: 'failed',
        message: 'Invalid beneficiary account number'
      };
    }
    
    const sourceAccount = mockAccounts.find(acc => acc.id === transfer.sourceAccountId);
    if (!sourceAccount || sourceAccount.balance < transfer.amount) {
      return {
        id: '',
        status: 'failed',
        message: 'Insufficient funds'
      };
    }
    
    return {
      id: `TXF-${Date.now()}`,
      status: 'success',
      message: 'Transfer initiated successfully'
    };
  }
};

export type { Account, Transaction, TransferRequest, TransferResponse };