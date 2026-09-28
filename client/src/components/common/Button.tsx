import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants: Record<string, string> = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 focus:ring-indigo-500 border border-transparent',
    secondary:
      'bg-slate-800 hover:bg-slate-900 text-white shadow-sm focus:ring-slate-700 border border-transparent',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-indigo-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400 border border-transparent',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200 focus:ring-rose-500 border border-transparent',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 focus:ring-emerald-500 border border-transparent',
  };

  const sizes: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
