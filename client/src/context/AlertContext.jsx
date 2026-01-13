import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from '@/components/ui/alert-dialog';

const AlertContext = createContext();

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    open: false,
    type: 'info',
    title: '',
    message: '',
    autoClose: 0,
    onConfirm: undefined,
    showCancel: false,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar'
  });

  const showAlert = useCallback(({ 
    type = 'info', 
    title, 
    message, 
    autoClose = 0, 
    onConfirm, 
    confirmText = 'Aceptar',
    showCancel = false,
    cancelText = 'Cancelar'
  }) => {
    setAlertState({
      open: true,
      type,
      title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : type === 'warning' ? 'Advertencia' : 'Información'),
      message,
      autoClose,
      onConfirm,
      confirmText,
      showCancel,
      cancelText
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, open: false }));
  }, []);

  // Helper methods for cleaner usage
  const success = (message, title = 'Éxito', options = {}) => showAlert({ type: 'success', message, title, ...options });
  const error = (message, title = 'Error', options = {}) => showAlert({ type: 'error', message, title, ...options });
  const warning = (message, title = 'Advertencia', options = {}) => showAlert({ type: 'warning', message, title, ...options });
  const info = (message, title = 'Información', options = {}) => showAlert({ type: 'info', message, title, ...options });

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert, success, error, warning, info }}>
      {children}
      <Alert
        open={alertState.open}
        onOpenChange={(isOpen) => !isOpen && closeAlert()}
        type={alertState.type}
        title={alertState.title}
        autoClose={alertState.autoClose}
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
        showCancel={alertState.showCancel}
        cancelText={alertState.cancelText}
      >
        {alertState.message}
      </Alert>
    </AlertContext.Provider>
  );
}
