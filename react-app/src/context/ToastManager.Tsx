import { useState, createContext, useContext, useEffect } from 'react';
import Toast from '../components/Toast';


type ToastMessage = {
  id: number;
  message: string;
  type: string;
}

type ToastContextType = {
  toasts: ToastMessage[];
  addToast: (message: string, type: string) => void;
};


const ToastContext = createContext<ToastContextType | undefined>(undefined);


export const ToastManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    console.log('ToastManager rendered');
  }, []);


  const addToast = (message: string, type: string) => {
    console.log('Adding toast:', { message, type });
    setToasts([...toasts, { id: Date.now(), message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(toasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{toasts , addToast}}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};


export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};