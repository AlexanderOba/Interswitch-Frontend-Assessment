import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Account } from '../services/api';
import { Eye, EyeOff, Filter, ArrowUpDown, CreditCard, TrendingUp, Wallet } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBalances, setShowBalances] = useState<{ [key: string]: boolean }>({});
  const [filterType, setFilterType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'balance' | 'lastTransaction'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [accounts, filterType, sortBy, sortOrder]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err) {
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = accounts;

    // Apply filter
    if (filterType !== 'All') {
      filtered = filtered.filter(account => account.type === filterType);
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === 'balance') {
        return sortOrder === 'desc' ? b.balance - a.balance : a.balance - b.balance;
      } else {
        const aDate = new Date(a.lastTransactionDate).getTime();
        const bDate = new Date(b.lastTransactionDate).getTime();
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      }
    });

    setFilteredAccounts(filtered);
  };

  const toggleBalanceVisibility = (accountId: string) => {
    setShowBalances(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const maskAccountNumber = (accountNumber: string) => {
    return '**** **** **** ' + accountNumber.slice(-4);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Savings':
        return <Wallet className="h-6 w-6 text-green-600" />;
      case 'Current':
        return <CreditCard className="h-6 w-6 text-blue-600" />;
      case 'Loan':
        return <TrendingUp className="h-6 w-6 text-red-600" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchAccounts}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Overview</h1>
        <p className="text-gray-600">Manage your accounts and view recent activity</p>
      </div>

      {/* Filters and Sorting */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Accounts</option>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Loan">Loan</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'balance' | 'lastTransaction');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="balance-desc">Balance (High to Low)</option>
              <option value="balance-asc">Balance (Low to High)</option>
              <option value="lastTransaction-desc">Recent Activity</option>
              <option value="lastTransaction-asc">Oldest Activity</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          {filteredAccounts.length} of {accounts.length} accounts
        </p>
      </div>

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <Link
            key={account.id}
            to={`/accounts/${account.id}`}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md p-6 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getAccountIcon(account.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {account.type} Account
                    </h3>
                    <p className="text-sm text-gray-600">
                      {maskAccountNumber(account.accountNumber)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  account.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {account.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Balance</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleBalanceVisibility(account.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showBalances[account.id] ? 
                      <EyeOff className="h-4 w-4" /> : 
                      <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>
                <p className={`text-2xl font-bold ${
                  account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                } ${showBalances[account.id] ? 'account-balance-visible' : 'account-balance-hidden'}`}>
                  {formatCurrency(account.balance, account.currency)}
                </p>
              </div>

              <div className="text-sm text-gray-600">
                <p>Last Transaction:</p>
                <p className="font-medium">
                  {format(new Date(account.lastTransactionDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
          <p className="text-gray-600">
            {filterType === 'All' 
              ? 'No accounts available to display.' 
              : `No ${filterType} accounts found. Try a different filter.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;