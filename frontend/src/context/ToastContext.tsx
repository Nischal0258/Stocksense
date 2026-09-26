import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '../types/inventory';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (title: string, description: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, description: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let icon = <Info className="w-5 h-5 text-[#DBBA95]" />;
          let borderAccent = 'border-l-4 border-l-[#DBBA95]';

          if (toast.type === 'success') {
            icon = <CheckCircle2 className="w-5 h-5 text-[#49C98A]" />;
            borderAccent = 'border-l-4 border-l-[#49C98A]';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-[#F5A623]" />;
            borderAccent = 'border-l-4 border-l-[#F5A623]';
          } else if (toast.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-[#E87883]" />;
            borderAccent = 'border-l-4 border-l-[#E87883]';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg bg-white/95 backdrop-blur-md border border-white/80 ${borderAccent} transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
            >
              <div className="mt-0.5 shrink-0">{icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#242633]">{toast.title}</h4>
                <p className="text-xs text-[#686878] mt-0.5 leading-relaxed">{toast.description}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-[#686878] hover:text-[#242633] hover:bg-[#EEE8E3]/60 rounded-md transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
