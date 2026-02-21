import AppSidebar from '@/components/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from 'sonner'

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<SidebarProvider>
			<AppSidebar />
			{/* 2. Основной контент */}
			<main className='relative flex-1 flex flex-col min-h-screen'>
				{/* Хедер страницы, где живет кнопка */}
				<header className='flex h-16 items-center gap-2 border-b px-4'>
					<SidebarTrigger className='-ml-1' />
					{/* -ml-1 чуть-чуть пододвинет кнопку для красоты */}
					<div className='h-4 w-[1px] bg-border mx-2' />
					<h1 className='text-sm font-medium'>Панель управления</h1>
					<div className='flex items-center gap-4'></div>
				</header>

				{/* Сама страница */}
				<div className='p-4 flex-1'>{children}</div>
				<Toaster position='top-center' richColors />
			</main>
		</SidebarProvider>
	)
}
