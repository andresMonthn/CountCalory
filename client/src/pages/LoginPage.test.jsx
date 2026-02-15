import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as AuthContext from '../context/AuthContext';

// Mock Auth Context
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockLoginWithPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    AuthContext.useAuth.mockReturnValue({
      user: null,
      login: mockLogin,
      loginWithPassword: mockLoginWithPassword,
      loading: false
    });
  });

  it('renders login form by default', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleButton = screen.getByLabelText('Mostrar contraseña');

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Ocultar contraseña')).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows forgot password link', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    const link = screen.getByText(/¿Olvidaste tu contraseña?/i);
    expect(link).toHaveAttribute('href', '/forgot-password');
  });
});
