import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

const variants = {
  default: "bg-blue-500 text-white hover:bg-blue-600",
  outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
  ghost: "hover:bg-gray-100 text-gray-900",
}

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
}

export function Button({
  children,
  className = "",
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}