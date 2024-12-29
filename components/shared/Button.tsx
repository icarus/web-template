'use client'

import { ButtonHTMLAttributes } from 'react'
import { useTranslation } from 'next-i18next'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  label: string
}

export function Button({ variant = 'primary', label, ...props }: ButtonProps) {
  const { t } = useTranslation()

  return (
    <button
      className={`rounded-md px-4 py-2 ${
        variant === 'primary'
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      }`}
      {...props}
    >
      {t(label)}
    </button>
  )
}
