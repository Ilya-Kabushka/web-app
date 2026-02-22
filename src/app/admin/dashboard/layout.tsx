import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Путь к конфигу NextAuth
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import AppSidebar from '@/components/AppSidebar'
import { AuthProvider } from '@/components/providers/session-provider'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from 'sonner'

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	// 1. Получаем сессию на сервере
	const session = await getServerSession(authOptions)

	// 2. Если сессии нет или роль 'USER' — редиректим (второй слой защиты после Middleware)
	if (!session || session.user.role === 'USER') {
		redirect('/admin/login')
	}

	// 3. Подготавливаем данные для компонента NavUser
	// Добавляем роль, так как мы хотели её отображать
	const userData = {
		name: session.user.name || 'Администратор',
		email: session.user.email || '',
		avatar: session.user.image || '', // Ссылка на аватар из БД
		role: session.user.role, // Наша кастомная роль
	}

	return (
		<AuthProvider>
			<SidebarProvider>
				{/* Передаем данные пользователя в сайдбар */}
				<AppSidebar user={userData} />

				<main className='relative flex-1 flex flex-col min-h-screen'>
					<header className='flex h-16 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10'>
						<SidebarTrigger className='-ml-1' />
						<div className='h-4 w-[1px] bg-border mx-2' />
						<h1 className='text-sm font-medium'>Панель управления</h1>

						{/* Сюда можно добавить хлебные крошки или поиск */}
					</header>

					<div className='p-4 flex-1'>{children}</div>

					<Toaster position='top-center' richColors />
				</main>
			</SidebarProvider>
		</AuthProvider>
	)
}
