"use client"

import * as React from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = React.useState(open)

  const handleChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <div>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              isOpen,
              onOpenChange: handleChange,
            })
          : child
      )}
    </div>
  )
}

export function DialogTrigger({
  children,
  asChild,
  isOpen,
  onOpenChange,
  ...props
}: {
  children: React.ReactNode
  asChild?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  [key: string]: any
}) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => onOpenChange?.(!isOpen),
      ...props,
    })
  }

  return (
    <button onClick={() => onOpenChange?.(!isOpen)} {...props}>
      {children}
    </button>
  )
}

export function DialogContent({
  children,
  isOpen,
  onOpenChange,
  className = "",
}: {
  children: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => onOpenChange?.(false)} />
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 p-6 max-w-2xl max-h-[90vh] overflow-auto ${className}`}>
        {children}
      </div>
    </>
  )
}

export function DialogHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export function DialogTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>
}

export function DialogDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
}