import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { isDemoMode, DEMO_EMAIL, DEMO_PASSWORD } from '@/utils/demo';

export const AuthContext = createContext(null);

// ── Demo auth state ───────────────────────────────────────

let _demoUser = null;
const _demoListeners = new Set();

function setDemoUser(user) {
  _demoUser = user;
  _demoListeners.forEach((cb) => cb(user));
}

// ── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (isDemoMode()) {
      // Restore demo session from sessionStorage
      const saved = sessionStorage.getItem('batman_demo_auth');
      const demoUser = saved ? JSON.parse(saved) : null;
      _demoUser = demoUser;
      setUser(demoUser);

      _demoListeners.add(setUser);
      return () => _demoListeners.delete(setUser);
    }

    // Real Firebase auth
    let unsub;
    try {
      unsub = onAuthStateChanged(
        auth,
        (u) => setUser(u ?? null),
        (err) => {
          console.warn('Auth state error:', err.message);
          setUser(null);
          setAuthError(err.message);
        }
      );
    } catch (err) {
      console.warn('Firebase Auth not available:', err.message);
      setUser(null);
      setAuthError(err.message);
    }
    return () => unsub?.();
  }, []);

  const login = async (email, password) => {
    if (isDemoMode()) {
      if (
        email.trim().toLowerCase() === DEMO_EMAIL &&
        password === DEMO_PASSWORD
      ) {
        const demoUser = { email: DEMO_EMAIL, uid: 'demo-admin', displayName: 'Demo Admin' };
        sessionStorage.setItem('batman_demo_auth', JSON.stringify(demoUser));
        setDemoUser(demoUser);
        return demoUser;
      }
      throw Object.assign(
        new Error(`Incorrect email or password.\n\nDemo credentials:\nEmail: ${DEMO_EMAIL}\nPassword: ${DEMO_PASSWORD}`),
        { code: 'auth/invalid-credential' }
      );
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isDemoMode()) {
      sessionStorage.removeItem('batman_demo_auth');
      setDemoUser(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading: user === undefined, authError, isDemo: isDemoMode() }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
