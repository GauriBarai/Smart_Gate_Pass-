import type React from "react"
import type { ReactNode } from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive"
  size?: "sm" | "md" | "lg"
  children: ReactNode
}

export function Button({ variant = "default", size = "md", className = "", children, ...props }: ButtonProps) {
  const baseClass = "font-semibold rounded-lg transition-colors"
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-gray-300 hover:bg-gray-50",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
  }
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
