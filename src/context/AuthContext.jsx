import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/resources';
import { message } from '../services/api';
const AuthContext = createContext(null);
const demoUsers = {
  admin: { name: 'Selam Admin', email: 'admin@astu.edu.et', role: 'admin' },
  mentor: { name: 'Abel Mentor', email: 'mentor@astu.edu.et', role: 'mentor' },
  student: { name: 'Marta Student', email: 'student@astu.edu.et', role: 'student' },
};
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('msj_user') || 'null'));
  const [loading, setLoading] = useState(false);
  const save = (token, currentUser) => {
    localStorage.setItem('msj_token', token);
    localStorage.setItem('msj_user', JSON.stringify(currentUser));
    setUser(currentUser);
  };
  const login = async (values) => {
    setLoading(true);
    try {
      try {
        const { data } = await authService.login(values);
        save(data.token, data.user);
        return data.user;
      } catch (e) {
        if (import.meta.env.VITE_API_URL) throw e;
        const role =
          values.email?.split('@')[0] in demoUsers ? values.email.split('@')[0] : 'student';
        const registered = JSON.parse(localStorage.getItem('msj_registered_user') || 'null');
        const u = registered?.email === values.email ? registered : demoUsers[role];
        save('demo-token', u);
        return u;
      }
    } catch (e) {
      throw new Error(message(e));
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem('msj_token');
    localStorage.removeItem('msj_user');
    setUser(null);
  };
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, []);
  return (
    <AuthContext.Provider
      value={useMemo(
        () => ({ user, loading, login, logout, save, isAuthenticated: !!user }),
        [user, loading],
      )}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
