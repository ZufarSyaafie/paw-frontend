"use client"

import * as React from "react"

interface InputOTPProps {
  maxLength: number
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}

export function InputOTP({ maxLength, value, onChange, children }: InputOTPProps) {
  return (
    <div>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              value,
              onChange,
              maxLength,
            })
          : child
      )}
    </div>
  )
}

interface InputOTPGroupProps {
  className?: string
  children: React.ReactNode
  value?: string
  onChange?: (value: string) => void
  maxLength?: number
}

export function InputOTPGroup({ className = "", children, value = "", onChange, maxLength = 6 }: InputOTPGroupProps) {
  return (
    <div className={`flex ${className}`}>
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              value: value[index] || "",
              onChange: (newValue: string) => {
                const newOtp = value.split("")
                newOtp[index] = newValue.slice(-1)
                onChange?.(newOtp.join("").slice(0, maxLength))

                // Auto-focus next input
                if (newValue && index < maxLength - 1) {
                  const nextInput = document.querySelector(`[data-otp-index="${index + 1}"]`) as HTMLInputElement
                  nextInput?.focus()
                }
              },
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Backspace" && !value[index] && index > 0) {
                  const prevInput = document.querySelector(`[data-otp-index="${index - 1}"]`) as HTMLInputElement
                  prevInput?.focus()
                }
              },
            })
          : child
      )}
    </div>
  )
}

interface InputOTPSlotProps {
  index: number
  className?: string
  value?: string
  onChange?: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function InputOTPSlot({ index, className = "", value, onChange, onKeyDown }: InputOTPSlotProps) {
  return (
    <input
      data-otp-index={index}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={onKeyDown}
      className={className}
    />
  )
}