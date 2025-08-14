import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Account, TransferRequest, TransferResponse } from '../services/api';
import { ArrowLeft, Send, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const FundsTransfer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sourceAccount, setSourceAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResponse | null>(null);

  const [formData, setFormData] = useState({
    sourceAccountId: '',
    beneficiaryAccount: '',
    amount: '',
    description: ''
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchAccounts();
  }, [id]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await api.getAccounts();
      setAccounts(accountsData.filter(acc => acc.type !== 'Loan'));
      
      if (id) {
        const currentAccount = accountsData.find(acc => acc.id === id);
        if (currentAccount && currentAccount.type !== 'Loan') {
          setSourceAccount(currentAccount);
          setFormData(prev => ({ ...prev, sourceAccountId: id }));
        } else {
          setError('Invalid source account or loan accounts cannot transfer funds');
        }
      }
    } catch (err) {
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.sourceAccountId) {
      errors.sourceAccountId = 'Please select a source account';
    }

    if (!formData.beneficiaryAccount) {
      errors.beneficiaryAccount = 'Beneficiary account number is required';
    } else if (formData.beneficiaryAccount.length < 10) {
      errors.beneficiaryAccount = 'Account number must be at least 10 digits';
    } else if (!/^\d+$/.test(formData.beneficiaryAccount)) {
      errors.beneficiaryAccount = 'Account number must contain only digits';
    }

    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Amount must be a positive number';
      } else if (sourceAccount && amount > sourceAccount.balance) {
        errors.amount = 'Insufficient funds';
      } else if (amount > 100000) {
        errors.amount = 'Amount cannot exceed $100,000';
      }
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length > 100) {
      errors.description = 'Description cannot exceed 100 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'sourceAccountId') {
      const account = accounts.find(acc => acc.id === value);
      setSourceAccount(account || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const confirmTransfer = async () => {
    try {
      setSubmitting(true);
      const transferData: TransferRequest = {
        sourceAccountId: formData.sourceAccountId,
        beneficiaryAccount: formData.beneficiaryAccount,
        amount: parseFloat(formData.amount),
        description: formData.description
      };

      const result = await api.initiateTransfer(transferData);
      setTransferResult(result);
      setShowConfirmation(false);
      
      if (result.status === 'success') {
        // Refresh account data
        await fetchAccounts();
      }
    } catch (err) {
      setError('Failed to process transfer');
      setShowConfirmation(false);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error && !transferResult) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <button 
            onClick={() => navigate(`/accounts/${id}`)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account Details
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(`/accounts/${id}`)}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Account Details
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Transfer Funds</h1>
        <p className="text-gray-600">Send money to another account securely</p>
      </div>

      {/* Transfer Result */}
      {transferResult && (
        <div className={`rounded-lg p-6 mb-6 ${
          transferResult.status === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {transferResult.status === 'success' ? (
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 mr-3" />
            )}
            <div>
              <h3 className={`font-semibold ${
                transferResult.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {transferResult.status === 'success' ? 'Transfer Successful' : 'Transfer Failed'}
              </h3>
              <p className={`text-sm ${
                transferResult.status === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {transferResult.message}
              </p>
              {transferResult.status === 'success' && transferResult.id && (
                <p className="text-xs text-green-600 mt-1">
                  Transaction ID: {transferResult.id}
                </p>
              )}
            </div>
          </div>

          {transferResult.status === 'success' && (
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => {
                  setTransferResult(null);
                  setFormData({
                    sourceAccountId: id || '',
                    beneficiaryAccount: '',
                    amount: '',
                    description: ''
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Make Another Transfer
              </button>
              <button
                onClick={() => navigate(`/accounts/${id}/transactions`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Transactions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transfer Form */}
      {!transferResult && (
        <div className="bg-white rounded-lg shadow-md p-6 w-1/2 mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Account
              </label>
              <select
                value={formData.sourceAccountId}
                onChange={(e) => handleInputChange('sourceAccountId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.sourceAccountId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select source account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.type} - **** {account.accountNumber.slice(-4)} - {formatCurrency(account.balance)}
                  </option>
                ))}
              </select>
              {formErrors.sourceAccountId && (
                <p className="mt-1 text-sm text-red-600">{formErrors.sourceAccountId}</p>
              )}
            </div>

            {/* Available Balance */}
            {sourceAccount && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700">Available Balance</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(sourceAccount.balance)}
                </p>
              </div>
            )}

            {/* Beneficiary Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Account Number
              </label>
              <input
                type="text"
                value={formData.beneficiaryAccount}
                onChange={(e) => handleInputChange('beneficiaryAccount', e.target.value)}
                placeholder="Enter beneficiary account number"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.beneficiaryAccount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.beneficiaryAccount && (
                <p className="mt-1 text-sm text-red-600">{formErrors.beneficiaryAccount}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100000"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {formErrors.amount && (
                <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Maximum transfer limit: $100,000</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter transfer description"
                rows={3}
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between mt-1">
                {formErrors.description && (
                  <p className="text-sm text-red-600">{formErrors.description}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.description.length}/100
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send className="h-5 w-5 mr-2" />
              Proceed to Confirmation
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Transfer</h3>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">
                  {sourceAccount?.type} - **** {sourceAccount?.accountNumber.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">**** {formData.beneficiaryAccount.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg">{formatCurrency(parseFloat(formData.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium">{formData.description}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
              <p className="text-sm text-yellow-800">
                Please review the transfer details carefully. This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  'Confirm Transfer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsTransfer;