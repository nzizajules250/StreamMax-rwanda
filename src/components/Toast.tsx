import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div 
      id="toast-container" 
      className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void; key?: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" id="icon-success" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" id="icon-error" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" id="icon-info" />,
    warning: <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" id="icon-warning" />
  };

  const bgStyles = {
    success: 'bg-slate-900/95 border-emerald-500/30 text-emerald-50 shadow-emerald-950/20',
    error: 'bg-slate-900/95 border-rose-500/30 text-rose-50 shadow-rose-950/20',
    info: 'bg-slate-900/95 border-sky-500/30 text-sky-50 shadow-sky-950/20',
    warning: 'bg-slate-900/95 border-amber-500/30 text-amber-50 shadow-amber-950/20'
  };

  return (
    <motion.div
      id={`toast-${toast.id}`}
      layout
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${bgStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm font-medium pr-2 leading-tight">
        {toast.message}
      </div>
      <button
        id={`dismiss-toast-${toast.id}`}
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
