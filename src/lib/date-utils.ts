// Простое форматирование даты без зависимостей
export function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		locale: 'ru-RU',
	}
	return d.toLocaleDateString('ru-RU', options)
}

export function formatDateTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		locale: 'ru-RU',
	}
	return d.toLocaleDateString('ru-RU', options)
}

export function formatDateShort(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	const day = String(d.getDate()).padStart(2, '0')
	const month = String(d.getMonth() + 1).padStart(2, '0')
	const year = d.getFullYear()
	return `${day}.${month}.${year}`
}
