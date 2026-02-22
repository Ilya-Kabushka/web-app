import { Decimal } from '@/generated/prisma/internal/prismaNamespace'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// src/lib/formatters.ts
export function formatPrice(price: number | string | Decimal) {
	const numericPrice = typeof price === 'object' ? Number(price) : Number(price)

	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(numericPrice)
}
