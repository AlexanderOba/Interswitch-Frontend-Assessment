import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface SessionContextType {
  showWarning: boolean;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const WARNING_TIME = 4 * 60 * 1000; // 4 minutes (1 minute warning)

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout: authLogout  } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetSession = () => {
    setLastActivity(Date.now());
    setShowWarning(false);
  };

   const handleLogout = () => {
    setShowWarning(false);
    authLogout();
  };

  useEffect(() => {
    if (isAuthenticated) {
      resetSession();
    }
  }, [isAuthenticated]); 

useEffect(() => {
  if (!isAuthenticated) return;

  const handleActivity = () => {
    resetSession();
  };

  const events = [ 'keydown', 'scroll', 'touchstart'];

  const attachListeners = () => {
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });
  };

  const removeListeners = () => {
    events.forEach(event => {
      document.removeEventListener(event, handleActivity);
    });
  };

  attachListeners();

  const checkSession = () => {
    const now = Date.now();
    const timeElapsed = now - lastActivity;

    if (timeElapsed >= SESSION_TIMEOUT) {
      removeListeners(); 
      clearInterval(interval); 
      handleLogout();
      setShowWarning(false);
    } else if (timeElapsed >= WARNING_TIME && !showWarning) {
      setShowWarning(true);
    }
  };

  const interval = setInterval(checkSession, 1000);

  return () => {
    removeListeners();
    clearInterval(interval);
  };
}, [isAuthenticated, lastActivity, showWarning]);

  return (
    <SessionContext.Provider value={{ showWarning, resetSession }}>
      {children}
      {showWarning && (
        <SessionWarningModal onContinue={resetSession} onLogout={handleLogout} />
      )}
    </SessionContext.Provider>
  );
};

const SessionWarningModal: React.FC<{ onContinue: () => void; onLogout: () => void }> = ({
  onContinue,
  onLogout
}) => {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Clear any remaining timers before logout
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Session Timeout Warning</h3>
        <p className="text-gray-700 mb-4">
          Your session will expire in {countdown} seconds due to inactivity. 
          Click "Continue" to extend your session.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};