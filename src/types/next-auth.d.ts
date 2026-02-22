import { DefaultSession } from 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
	/**
	 * Расширяем структуру объекта Session
	 */
	interface Session {
		user: {
			id: string
			role: string // Добавляем нашу роль
		} & DefaultSession['user']
	}

	/**
	 * Расширяем структуру объекта User (то, что приходит из БД)
	 */
	interface User {
		role: string
	}
}

declare module 'next-auth/jwt' {
	/**
	 * Расширяем структуру JWT токена
	 */
	interface JWT {
		role?: string
	}
}
