// src/lib/formatters.ts

import { Decimal } from '@/generated/prisma/internal/prismaNamespace'

export function formatPrice(price: number | string | Decimal) {
	// Преобразуем Prisma Decimal или строку в число
	const numericPrice = typeof price === 'object' ? Number(price) : Number(price)

	// Проверка на валидность числа
	if (isNaN(numericPrice)) {
		return '0 ₽'
	}

	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(numericPrice)
}

export function formatRating(rating: number | string | Decimal) {
	const numericRating =
		typeof rating === 'object' ? Number(rating) : Number(rating)

	return numericRating.toFixed(1)
}

export function formatDate(date: Date | string) {
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date(date))
}
