import React from 'react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface CardProps {
  hover?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  id?: string;
  key?: React.Key;
}

export const Card = ({ className, hover, children, ...props }: CardProps) => (
  <div 
    className={cn(
      "bg-white rounded-lg border border-slate-200 p-4 transition-all duration-200",
      hover && "hover:shadow-lg hover:border-primary/20 cursor-pointer overflow-hidden group",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error' | 'info', onClose: () => void }) => {
  const bg = {
    success: 'bg-emerald-600',
    error: 'bg-rose-600',
    info: 'bg-blue-600'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn("fixed bottom-4 left-4 right-4 sm:bottom-8 sm:right-8 sm:left-auto z-[100] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center justify-between sm:justify-start gap-3", bg[type])}
    >
      <span className="font-medium text-sm sm:text-base">{message}</span>
      <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </motion.div>
  );
};

export const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'info', className?: string }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 modal-backdrop transition-all"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full modal-panel bg-white overflow-hidden border border-white/8"
          >
            <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-4 flex items-center justify-between">
              <h3 className="font-bold text-2xl sm:text-3xl tracking-tight text-slate-900">{title}</h3>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 sm:px-10 pb-10 sm:pb-12 pt-2">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' | 'icon', isLoading?: boolean }>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-[#003366] text-white hover:bg-[#002244] shadow-sm",
      secondary: "bg-[#FFB800] text-slate-900 hover:bg-[#E5A600] font-bold shadow-sm",
      outline: "border-2 border-slate-200 bg-transparent hover:border-primary/50 hover:bg-slate-50 text-slate-900",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
      danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
    };
    
    const sizes = {
      sm: "h-9 px-4 text-xs rounded-xl",
      md: "h-11 px-6 rounded-xl",
      lg: "h-12 px-8 rounded-lg text-base font-semibold tracking-tight",
      icon: "h-10 w-10 flex items-center justify-center rounded-xl",
    };

    return (
      <button 
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none active:scale-95 gap-2", 
          variants[variant], 
          sizes[size], 
          className
        )} 
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
