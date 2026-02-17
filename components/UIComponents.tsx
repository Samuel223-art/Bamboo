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
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-2.5 py-1.5 text-[10px]",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-3 text-sm"
  };

  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-sm focus:ring-brand-500 border border-transparent",
    secondary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm focus:ring-emerald-500 border border-transparent",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 border border-transparent",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
    outline: "bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
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
      {label && <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
            {React.cloneElement(icon as React.ReactElement, { size: 14 })}
          </div>
        )}
        <input 
          className={`
            w-full bg-white dark:bg-gray-800 border rounded-lg py-2 
            ${icon ? 'pl-8' : 'pl-3'} pr-3 
            text-xs text-gray-900 dark:text-white placeholder-gray-400 
            focus:ring-1 focus:ring-brand-500 focus:border-brand-500 
            transition-all duration-200
            ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-[9px] text-red-500 font-bold">{error}</p>}
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

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder || "Seleccionar";

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
       {label && <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>}
       <button 
         type="button"
         onClick={() => setIsOpen(!isOpen)}
         className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-3 pr-8 text-left text-xs focus:ring-1 focus:ring-brand-500 transition-all flex items-center gap-2"
       >
         {icon && <span className="text-gray-400">{icon}</span>}
         <span className={`block truncate ${!value && placeholder ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {selectedLabel}
         </span>
         <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown size={12} className="text-gray-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
         </span>
       </button>

       {isOpen && (
         <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none animate-scale-up origin-top">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  relative cursor-pointer select-none py-2 pl-3 pr-8 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                  ${value === option.value ? 'font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/10' : 'text-gray-900 dark:text-gray-100'}
                `}
              >
                <span className="block truncate">{option.label}</span>
                 {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-brand-600 dark:text-brand-400">
                      <Check size={10} />
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
      <p className="text-xs font-bold text-gray-900 dark:text-white">{label}</p>
      {description && <p className="text-[9px] text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500 ${
        checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm ${className}`}>
    {children}
  </div>
);

// --- MODAL ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500">
            <X size={16} />
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
    completado: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    verified: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    verificado: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    active: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    activo: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    pendiente: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    failed: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    fallido: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    cancelled: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    cancelado: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    disputed: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    en_disputa: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    unverified: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    no_verificado: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  const icons: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 size={10} className="mr-1" />,
    completado: <CheckCircle2 size={10} className="mr-1" />,
    verified: <CheckCircle2 size={10} className="mr-1" />,
    verificado: <CheckCircle2 size={10} className="mr-1" />,
    active: <Clock size={10} className="mr-1" />,
    activo: <Clock size={10} className="mr-1" />,
    pending: <Clock size={10} className="mr-1" />,
    pendiente: <Clock size={10} className="mr-1" />,
    failed: <XCircle size={10} className="mr-1" />,
    fallido: <XCircle size={10} className="mr-1" />,
    cancelled: <XCircle size={10} className="mr-1" />,
    cancelado: <XCircle size={10} className="mr-1" />,
    disputed: <XCircle size={10} className="mr-1" />,
    en_disputa: <XCircle size={10} className="mr-1" />,
    unverified: <XCircle size={10} className="mr-1" />,
    no_verificado: <XCircle size={10} className="mr-1" />,
  };

  const normalizedStatus = status.toLowerCase();
  
  // Basic mapping for Spanish display
  const statusMapping: Record<string, string> = {
    completed: 'Completado',
    verified: 'Verificado',
    active: 'Activo',
    pending: 'Pendiente',
    failed: 'Fallido',
    cancelled: 'Cancelado',
    disputed: 'En Disputa',
    unverified: 'No Verificado',
    'pending_acceptance': 'Esperando Aceptación'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${styles[normalizedStatus] || styles.pending}`}>
      {icons[normalizedStatus]}
      {statusMapping[normalizedStatus] || status}
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
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 14 })}
    </div>
  );
};

// --- TRANSACTION ROW ---
import { Transaction } from '../types';

export const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isPositive = transaction.type === 'deposit' || transaction.type === 'commission';
  
  return (
    <div className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isPositive ? 'bg-green-50 text-green-600 dark:bg-green-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
          {isPositive ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[140px] sm:max-w-none">{transaction.description}</p>
          <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{new Date(transaction.date).toLocaleDateString('es-ES')}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-xs font-black ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
          {isPositive ? '+' : '-'}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <StatusBadge status={transaction.status} />
      </div>
    </div>
  );
};
