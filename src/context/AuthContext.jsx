import { createContext, useContext, useState, useEffect } from 'react';
import { pushSignUpEvent, pushLoginEvent, pushUserId } from '../utils/analytics';

const AuthContext = createContext(null);

async function parseErrorMessage(response) {
  try {
    const data = await response.json();
    return data.error || 'Something went wrong. Please try again.';
  } catch {
    return 'Something went wrong. Please try again.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signup = async ({ name, email, password }) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      throw new Error(await parseErrorMessage(res));
    }
    const data = await res.json();
    setUser(data);
    pushSignUpEvent();
    return data;
  };

  const login = async ({ email, password }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error(await parseErrorMessage(res));
    }
    const data = await res.json();
    setUser(data);
    pushLoginEvent();
    return data;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    // Belt-and-suspenders: push null immediately rather than waiting for the
    // next route's LocationTracker effect, so no window exists where a stale
    // user_id could still be read.
    pushUserId(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
