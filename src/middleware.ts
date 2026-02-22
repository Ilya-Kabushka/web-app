import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
	function middleware(req) {
		const token = req.nextauth.token
		const path = req.nextUrl.pathname

		// Если пользователь авторизован, но пытается зайти в админку с ролью USER
		if (path.startsWith('/admin') && token?.role === 'USER') {
			return NextResponse.redirect(new URL('/', req.url))
		}
	},
	{
		callbacks: {
			// Middleware сработает только если этот колбэк вернет true
			// !!token означает "пользователь залогинен"
			authorized: ({ token }) => !!token,
		},
		pages: {
			signIn: '/admin/login', // Куда отправлять неавторизованных
		},
	},
)

// Массив путей, которые ДОЛЖЕН обрабатывать Middleware
export const config = {
	matcher: [
		// Защищаем дашборд и все его подстраницы
		'/admin/dashboard/:path*',
		// Если есть другие страницы админки, добавь их сюда
		'/admin/analytics/:path*',
		'/admin/settings/:path*',
	],
}
