
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { ref, get, set, onValue, update, push } from 'firebase/database';
import { auth, db, googleProvider } from './firebase';
import { UserProfile, AuthState } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import ScanPay from './pages/ScanPay';
import MyQR from './pages/MyQR';
import History from './pages/History';
import SendMoney from './pages/SendMoney';
import Login from './pages/Login';
import Rewards from './pages/Rewards';

// Components
import Navbar from './components/Navbar';

interface AuthContextType {
  authState: AuthState;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateBalance: (newBalance: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        let userData: UserProfile;
        
        if (!snapshot.exists()) {
          userData = {
            uid: user.uid,
            displayName: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            vpa: `${user.email?.split('@')[0] || user.uid.slice(0, 6)}@payfast`,
            balance: 50, // Pro bonus
            joinedAt: Date.now(),
          };
          await set(userRef, userData);
        } else {
          userData = snapshot.val();
        }

        onValue(userRef, (sn) => {
          if (sn.exists()) {
            setAuthState({ user: sn.val(), loading: false });
          }
        });
      } else {
        setAuthState({ user: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (authState.user) {
      const userRef = ref(db, `users/${authState.user.uid}`);
      await update(userRef, { balance: newBalance });
    }
  };

  if (authState.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_50px_rgba(79,70,229,0.3)]"></div>
          <h1 className="text-white text-2xl font-black tracking-tighter">PayFast Pro</h1>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout, updateBalance }}>
      <Router>
        <div className="min-h-screen max-w-md mx-auto bg-slate-950 relative pb-20 shadow-2xl overflow-hidden border-x border-white/5">
          <Routes>
            <Route path="/login" element={authState.user ? <Navigate to="/" /> : <Login />} />
            <Route path="/" element={authState.user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/scan" element={authState.user ? <ScanPay /> : <Navigate to="/login" />} />
            <Route path="/my-qr" element={authState.user ? <MyQR /> : <Navigate to="/login" />} />
            <Route path="/history" element={authState.user ? <History /> : <Navigate to="/login" />} />
            <Route path="/send" element={authState.user ? <SendMoney /> : <Navigate to="/login" />} />
            <Route path="/send/:vpa" element={authState.user ? <SendMoney /> : <Navigate to="/login" />} />
            <Route path="/rewards" element={authState.user ? <Rewards /> : <Navigate to="/login" />} />
          </Routes>
          {authState.user && <Navbar />}
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
