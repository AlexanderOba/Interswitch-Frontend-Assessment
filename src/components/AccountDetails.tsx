import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, Account } from '../services/api';
import { ArrowLeft, Eye, EyeOff, Send, Receipt, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const AccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAccount(id);
    }
  }, [id]);

  const fetchAccount = async (accountId: string) => {
    try {
      setLoading(true);
      const data = await api.getAccount(accountId);
      if (data) {
        setAccount(data);
      } else {
        setError('Account not found');
      }
    } catch (err) {
      setError('Failed to fetch account details');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error || 'Account not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Account Details</h1>
      </div>

      {/* Account Overview Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{account.type} Account</h2>
              <p className="text-gray-600">{maskAccountNumber(account.accountNumber)}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            account.status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {account.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current Balance</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className={`text-3xl font-bold ${
              account.balance >= 0 ? 'text-green-600' : 'text-red-600'
            } ${showBalance ? 'account-balance-visible' : 'account-balance-hidden'}`}>
              {formatCurrency(account.balance, account.currency)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm text-gray-600">Account Type</span>
            <p className="text-xl font-semibold text-gray-900">{account.type}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm text-gray-600">Last Activity</span>
            <p className="text-lg font-medium text-gray-900">
              {format(new Date(account.lastTransactionDate), 'MMM dd, yyyy')}
            </p>
            <p className="text-sm text-gray-600">
              {format(new Date(account.lastTransactionDate), 'HH:mm')}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          to={`/accounts/${account.id}/transactions`}
          className="flex items-center justify-center space-x-3 bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-colors"
        >
          <Receipt className="h-5 w-5" />
          <span className="font-medium">View Transaction History</span>
        </Link>

        {account.type !== 'Loan' && (
          <Link
            to={`/accounts/${account.id}/transfer`}
            className="flex items-center justify-center space-x-3 bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition-colors"
          >
            <Send className="h-5 w-5" />
            <span className="font-medium">Transfer Funds</span>
          </Link>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <p className="text-gray-900 font-mono">{account.accountNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <p className="text-gray-900">{account.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <p className="text-gray-900">{account.currency}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <p className="text-gray-900">{account.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;