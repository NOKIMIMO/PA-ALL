import React,{ useState, createContext, useContext, ReactNode } from 'react';
import Toast from '../components/Toast';
import { ToastType } from '../enum/toast';

interface ToastMessage {
    id: number;
    message: string;
    type:ToastType;
  }

interface ToastContextType {
  addToast: (message: string,type:ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastManagerProps {
  children: ReactNode;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string,type:ToastType) => {
    setToasts([...toasts, { id: Date.now(), message , type}]);
  };

  const removeToast = (id: number) => {
    setToasts(toasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
