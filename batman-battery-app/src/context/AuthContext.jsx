import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { isDemoMode, DEMO_EMAIL, DEMO_PASSWORD, MECHANIC_DEMO_EMAIL, MECHANIC_DEMO_PASSWORD } from '@/utils/demo';

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
    const cleanEmail = email.trim().toLowerCase();
    
    // Check local test mechanic user first
    if (
      cleanEmail === MECHANIC_DEMO_EMAIL.toLowerCase() &&
      password === MECHANIC_DEMO_PASSWORD
    ) {
      const mechanicUser = {
        email: MECHANIC_DEMO_EMAIL,
        uid: 'test-mech-001',
        role: 'mechanic',
        displayName: 'Rico M. (Test Mechanic)',
      };
      sessionStorage.setItem('batman_demo_auth', JSON.stringify(mechanicUser));
      setDemoUser(mechanicUser);
      setUser(mechanicUser);
      return mechanicUser;
    }

    if (isDemoMode()) {
      if (
        cleanEmail === DEMO_EMAIL &&
        password === DEMO_PASSWORD
      ) {
        const demoUser = { email: DEMO_EMAIL, uid: 'demo-admin', role: 'admin', displayName: 'Demo Admin' };
        sessionStorage.setItem('batman_demo_auth', JSON.stringify(demoUser));
        setDemoUser(demoUser);
        setUser(demoUser);
        return demoUser;
      }
      throw Object.assign(
        new Error(`Incorrect credentials.\n\nUse test user:\nEmail: ${MECHANIC_DEMO_EMAIL}\nPassword: ${MECHANIC_DEMO_PASSWORD}`),
        { code: 'auth/invalid-credential' }
      );
    }
    
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // Fallback for test mechanic account when using Firebase credentials
      if (cleanEmail === MECHANIC_DEMO_EMAIL.toLowerCase() && password === MECHANIC_DEMO_PASSWORD) {
        const fallbackMech = { email: MECHANIC_DEMO_EMAIL, uid: 'test-mech-001', role: 'mechanic' };
        setUser(fallbackMech);
        return fallbackMech;
      }
      throw err;
    }
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
