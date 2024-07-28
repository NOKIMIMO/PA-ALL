import { useEffect, useState } from 'react';
import { ToastType } from '../enum/toast';

interface ToastProps {
  message: string;
  onClose: () => void;
  type: ToastType;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, type }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 5000; 
    const interval = duration / 100;
    let progressValue = 100;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    const progressInterval = setInterval(() => {
      progressValue -= 1;
      setProgress(progressValue);
    }, interval);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onClose]);

  const computeStytle = () => {
    if (type === ToastType.SUCCESS) {
      return 'bg-success';
    }
    if (type === ToastType.ERROR) {
      return 'bg-error';
    }
    if (type === ToastType.INFO) {
      return 'bg-info';
    }
    if (type === ToastType.WARNING) {
      return 'bg-warning';
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${computeStytle()} text-white p-4 rounded shadow-lg`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 bg-transparent text-white">
          &times;
        </button>
      </div>
      <div className="w-full h-1 bg-gray-200 mt-2">
        <div
          className="h-full bg-white"
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        />
      </div>
    </div>
  );
};

export default Toast;