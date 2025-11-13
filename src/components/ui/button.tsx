"use client";
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    className,
    children,
    ...props 
  }, ref) => { 
    const baseClass = 'font-semibold rounded-lg transition-all duration-200'
    
    const variants = {
      primary: 'bg-cyan-600 text-white hover:bg-cyan-700',
      secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
      outline: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref} 
        className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? '...' : children}
      </button>
    )
  }
)

Button.displayName = "Button";
