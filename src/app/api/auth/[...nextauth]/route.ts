import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import NextAuth, { NextAuthOptions } from 'next-auth' // Добавили тип NextAuthOptions для красоты
import CredentialsProvider from 'next-auth/providers/credentials'

// 1. Выносим конфиг в экспортируемую константу
export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET, // Убедись, что эта переменная есть в .env
	pages: {
		signIn: '/admin/login',
	},
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Пароль', type: 'password' },
			},
			async authorize(credentials) {
				const user = await prisma.user.findUnique({
					where: { email: credentials?.email },
				})

				if (!user) {
					console.log('Пользователь не найден')
					return null
				}

				// 2. Используем bcrypt для сравнения введенного пароля и хеша из БД
				const isPasswordValid = await bcrypt.compare(
					credentials?.password || '',
					user.password,
				)

				if (!isPasswordValid) {
					console.log('Пароль не совпал (хеш проверка не прошла)')
					return null
				}

				return {
					id: user.id.toString(),
					email: user.email,
					name: `${user.firstName} ${user.lastName}`,
					role: user.role,
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role
			}
			return token
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.role = token.role as string
			}
			return session
		},
	},
	session: {
		strategy: 'jwt',
	},
}

// 2. Передаем эту константу в обработчик
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
