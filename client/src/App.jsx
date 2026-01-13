import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import LoginPage from './pages/LoginPage';
import VerifyPage from './pages/VerifyPage';
import CalculatorApp from './components/CalculatorApp';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <CalculatorApp />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
