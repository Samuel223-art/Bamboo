import React, { ButtonHTMLAttributes, InputHTMLAttributes, useState, useRef, useEffect } from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  X,
  ChevronDown,
  Check
} from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading, 
  size = 'md',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-2 text-sm",
    lg: "px-5 py-2.5 text-base"
  };

  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 focus:ring-brand-500 border border-transparent",
    secondary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 focus:ring-emerald-500 border border-transparent",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 border border-transparent",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
    outline: "bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
      {children}
    </button>
  );
};

// --- INPUT ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input 
          className={`
            w-full bg-white dark:bg-gray-800 border rounded-lg py-2 
            ${icon ? 'pl-9' : 'pl-3'} pr-3 
            text-sm text-gray-900 dark:text-white placeholder-gray-400 
            focus:ring-2 focus:ring-brand-500 focus:border-brand-500 
            transition-all duration-200
            ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
    </div>
  );
};

// --- SELECT ---
export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange, placeholder, label, className = '', icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder || "Select";

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
       {label && <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>}
       <button 
         type="button"
         onClick={() => setIsOpen(!isOpen)}
         className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-3 pr-10 text-left text-sm focus:ring-2 focus:ring-brand-500 transition-all flex items-center gap-2"
       >
         {icon && <span className="text-gray-400">{icon}</span>}
         <span className={`block truncate ${!value && placeholder ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {selectedLabel}
         </span>
         <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown size={14} className="text-gray-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
         </span>
       </button>

       {isOpen && (
         <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-800 py-1 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none animate-scale-up origin-top">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  relative cursor-pointer select-none py-2 pl-4 pr-10 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                  ${value === option.value ? 'font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/10' : 'text-gray-900 dark:text-gray-100'}
                `}
              >
                <span className="block truncate">{option.label}</span>
                 {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-600 dark:text-brand-400">
                      <Check size={12} />
                    </span>
                  )}
              </div>
            ))}
         </div>
       )}
    </div>
  )
}

// --- TOGGLE ---
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, description }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
      {description && <p className="text-[10px] text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
        checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm ${className}`}>
    {children}
  </div>
);

// --- MODAL ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- STATUS BADGE ---
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    verified: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    active: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    failed: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    cancelled: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    disputed: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    unverified: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  const icons: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 className="w-2.5 h-2.5 mr-1" />,
    verified: <CheckCircle2 className="w-2.5 h-2.5 mr-1" />,
    active: <Clock className="w-2.5 h-2.5 mr-1" />,
    pending: <Clock className="w-2.5 h-2.5 mr-1" />,
    failed: <XCircle className="w-2.5 h-2.5 mr-1" />,
    cancelled: <XCircle className="w-2.5 h-2.5 mr-1" />,
    disputed: <XCircle className="w-2.5 h-2.5 mr-1" />,
    unverified: <XCircle className="w-2.5 h-2.5 mr-1" />,
  };

  const normalizedStatus = status.toLowerCase();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[normalizedStatus] || styles.pending}`}>
      {icons[normalizedStatus]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// --- ICON BOX ---
export const IconBox: React.FC<{ icon: React.ReactNode; color?: 'brand' | 'emerald' | 'orange' | 'blue' | 'purple' }> = ({ icon, color = 'brand' }) => {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  };

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors[color]}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 16 })}
    </div>
  );
};

// --- TRANSACTION ROW ---
import { Transaction } from '../types';

export const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isPositive = transaction.type === 'deposit' || transaction.type === 'commission';
  
  return (
    <div className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-1 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isPositive ? 'bg-green-50 text-green-600 dark:bg-green-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
          {isPositive ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">{transaction.description}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-xs font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
          {isPositive ? '+' : '-'}${transaction.amount.toFixed(2)}
        </p>
        <StatusBadge status={transaction.status} />
      </div>
    </div>
  );
};