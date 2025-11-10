import type React from "react"
interface DialogProps {
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
}

interface DialogHeaderProps {
  children: React.ReactNode
}

interface DialogTitleProps {
  children: React.ReactNode
}

export function Dialog({ children }: DialogProps) {
  return <>{children}</>
}

export function DialogContent({ children }: DialogContentProps) {
  return <>{children}</>
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <>{children}</>
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <>{children}</>
}
