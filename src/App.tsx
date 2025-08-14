import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AccountDetails from './components/AccountDetails';
import Dashboard from './components/Dashboard';
import FundsTransfer from './components/FundsTransfer';
import Header from './components/Header';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import TransactionHistory from './components/TransactionHistory';
import { AuthProvider } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/accounts/:id" element={
                  <ProtectedRoute>
                    <AccountDetails />
                  </ProtectedRoute>
                } />
                <Route path="/accounts/:id/transactions" element={
                  <ProtectedRoute>
                    <TransactionHistory />
                  </ProtectedRoute>
                } />
                <Route path="/accounts/:id/transfer" element={
                  <ProtectedRoute>
                    <FundsTransfer />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;