import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      console.log(`📧 Enviando Magic Link a: ${apiUrl}/auth/login`);
      
      await axios.post(`${apiUrl}/auth/login`, { email });
      return { success: true };
    } catch (error) {
      console.error('❌ Error en Magic Link:', error);
      
      if (error.code === 'ERR_NETWORK') {
         return { success: false, error: 'No se pudo conectar con el servidor. Verifique su conexión.' };
      }

      return { success: false, error: error.response?.data?.message || 'Error sending login link' };
    }
  };

  const loginWithPassword = async (email, password) => {
    try {
      const apiUrl = API_URL;
      console.log(`🚀 Intentando login en: ${apiUrl}/auth/login-password`);
      
      const { data } = await axios.post(`${apiUrl}/auth/login-password`, { email, password });
      
      console.log('✅ Login exitoso, recibiendo token...');
      
      // 1. Set Auth Header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // 2. Persist to LocalStorage
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      // 3. Update State
      setUser(data);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error en Login:', error);
      
      if (error.code === 'ERR_NETWORK') {
        console.error('⚠️ Error de red: No se pudo conectar con el backend. Verifique que el servidor esté corriendo en el puerto correcto.');
        return { success: false, error: 'No se pudo conectar con el servidor. Verifique su conexión.' };
      }
      
      return { success: false, error: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  const verifyToken = async (email, token) => {
    try {
      console.log('🔐 Verifying token for:', email);
      const apiUrl = API_URL;
      const { data } = await axios.post(`${apiUrl}/auth/verify`, { email, token });
      
      console.log('✅ Token verified, user data received:', data);
      
      // 1. Set Auth Header FIRST
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // 2. Persist to LocalStorage
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      // 3. Update State
      setUser(data);
      
      return { success: true, user: data };
    } catch (error) {
      console.error('❌ Verify error:', error);
      return { success: false, error: error.response?.data?.message || 'Invalid token' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const updatePassword = async (password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const { data } = await axios.put(`${apiUrl}/auth/update-password`, { password });
      // Update local user state
      const updatedUser = { ...user, hasPassword: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: error.response?.data?.message || 'Error al actualizar contraseña' };
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithPassword,
    verifyToken,
    logout,
    updateUser,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
