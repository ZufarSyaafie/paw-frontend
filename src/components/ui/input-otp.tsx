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
    <div
      className={`
        flex justify-center gap-1 sm:gap-2
        max-w-[220px] sm:max-w-none mx-auto
        ${className}
      `}
    >
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              value: value[index] || "",
              onChange: (newValue: string) => {
                const arr = value.split("")
                arr[index] = newValue.slice(-1)
                onChange?.(arr.join("").slice(0, maxLength))
                if (newValue && index < maxLength - 1) {
                  (document.querySelector(`[data-otp-index="${index + 1}"]`) as HTMLInputElement)?.focus()
                }
              },
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Backspace" && !value[index] && index > 0) {
                  (document.querySelector(`[data-otp-index="${index - 1}"]`) as HTMLInputElement)?.focus()
                }
              }
            })
          : child
      )}
    </div>
  )
}

interface InputOTPSlotProps {
  index: number
  className?: string
  value: string
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
      className={`
        h-8 w-8 sm:h-11 sm:w-11
        border border-white/20 bg-white/[0.05] rounded-md
        text-[13px] sm:text-base font-semibold text-white text-center
        placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50
        focus:border-blue-400 focus:bg-white/[0.08] transition-all duration-200 backdrop-blur-sm
        ${className}
      `}
    />
  )
}