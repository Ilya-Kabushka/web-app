'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/store/use-cart-store'
import {
	ChevronDown,
	Home,
	LogIn,
	LogOut,
	Menu,
	Package,
	Search,
	Settings,
	ShoppingCart,
	Sparkles,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Category {
	id: number
	name: string
}

export function Header() {
	const totalItems = useCartStore(state => state.getTotalItems())
	const router = useRouter()
	const [categories, setCategories] = useState<Category[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [user, setUser] = useState<{ name?: string; email?: string } | null>(
		null,
	)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		fetchCategories()
		checkAuth()
	}, [])

	const fetchCategories = async () => {
		try {
			setIsLoading(true)
			const res = await fetch('/api/categories')
			if (res.ok) {
				const data = await res.json()
				setCategories(data.slice(0, 8))
			}
		} catch (error) {
			console.error('Failed to fetch categories:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const checkAuth = async () => {
		try {
			const res = await fetch('/api/auth/session')
			if (res.ok) {
				const session = await res.json()
				if (session?.user) {
					setIsAuthenticated(true)
					setUser(session.user)
				}
			}
		} catch (error) {
			console.error('Failed to check auth:', error)
		}
	}

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
		}
	}

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' })
			setIsAuthenticated(false)
			setUser(null)
			router.refresh()
		} catch (error) {
			console.error('Failed to logout:', error)
		}
	}

	if (!mounted) {
		return (
			<header className='sticky top-0 z-50 w-full border-b bg-linear-to-r from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 backdrop-blur supports-backdrop-filter:bg-white/80 dark:supports-backdrop-filter:bg-slate-900/80 shadow-sm'>
				<div className='container flex h-16 items-center gap-4 lg:gap-6'>
					<Link
						href='/'
						className='flex items-center gap-3 font-bold text-lg lg:text-xl whitespace-nowrap hover:opacity-80 transition-opacity'
					>
						<div className='h-9 w-9 rounded-xl bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg'>
							<Sparkles className='h-5 w-5' />
						</div>
						<span className='hidden sm:inline-block bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
							Shop
						</span>
					</Link>
					<div className='flex-1' />
					<ShoppingCart className='h-5 w-5 text-blue-600' />
				</div>
			</header>
		)
	}

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-linear-to-r from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 backdrop-blur supports-backdrop-filter:bg-white/80 dark:supports-backdrop-filter:bg-slate-900/80 shadow-sm'>
			<div className='container flex h-16 items-center gap-4 lg:gap-6'>
				{/* Mobile Menu */}
				<Sheet>
					<SheetTrigger asChild>
						<Button variant='ghost' size='icon' className='md:hidden'>
							<Menu className='h-5 w-5' />
							<span className='sr-only'>Open menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side='left' className='w-75'>
						<nav className='flex flex-col space-y-4 mt-4'>
							<Link href='/' className='flex items-center gap-2 font-semibold'>
								<Home className='h-4 w-4' />
								Главная
							</Link>
							<div className='border-t pt-4'>
								<p className='text-sm font-semibold text-muted-foreground mb-3'>
									Категории
								</p>
								<div className='space-y-2'>
									{categories.map(category => (
										<Link
											key={category.id}
											href={`/category/${category.id}`}
											className='block text-sm hover:text-primary transition-colors'
										>
											{category.name}
										</Link>
									))}
								</div>
							</div>
							{isAuthenticated ? (
								<div className='border-t pt-4'>
									<p className='text-sm font-semibold mb-2'>
										{user?.name || 'Аккаунт'}
									</p>
									<div className='space-y-2'>
										<Link
											href='/account'
											className='block text-sm hover:text-primary transition-colors'
										>
											<Package className='h-4 w-4 inline mr-2' />
											Мои заказы
										</Link>
										<Link
											href='/account/settings'
											className='block text-sm hover:text-primary transition-colors'
										>
											<Settings className='h-4 w-4 inline mr-2' />
											Настройки
										</Link>
										<button
											onClick={handleLogout}
											className='block text-sm hover:text-red-500 transition-colors w-full text-left'
										>
											<LogOut className='h-4 w-4 inline mr-2' />
											Выход
										</button>
									</div>
								</div>
							) : (
								<div className='border-t pt-4 space-y-2'>
									<Link
										href='/login'
										className='block text-sm hover:text-primary transition-colors'
									>
										<LogIn className='h-4 w-4 inline mr-2' />
										Вход
									</Link>
								</div>
							)}
						</nav>
					</SheetContent>
				</Sheet>

				{/* Logo */}
				<Link
					href='/'
					className='flex items-center gap-3 font-bold text-lg lg:text-xl whitespace-nowrap hover:opacity-80 transition-opacity'
				>
					<div className='h-9 w-9 rounded-xl bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-shadow'>
						<Sparkles className='h-5 w-5' />
					</div>
					<span className='hidden sm:inline-block bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
						Shop
					</span>
				</Link>

				{/* Categories Dropdown - Desktop */}
				<div className='hidden md:flex items-center gap-1'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								className='gap-2 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
								disabled={isLoading}
							>
								Категории
								<ChevronDown className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='start' className='w-48'>
							{categories.length > 0 ? (
								categories.map(category => (
									<Link key={category.id} href={`/category/${category.id}`}>
										<DropdownMenuItem className='cursor-pointer'>
											{category.name}
										</DropdownMenuItem>
									</Link>
								))
							) : (
								<DropdownMenuItem disabled>Нет категорий</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Search */}
				<form
					onSubmit={handleSearch}
					className='flex-1 flex items-center gap-2 max-w-md lg:max-w-lg'
				>
					<div className='relative w-full'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none' />
						<input
							type='search'
							placeholder='Найти товары...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className='w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-shadow'
						/>
					</div>
				</form>

				{/* Actions */}
				<div className='flex items-center gap-2 lg:gap-3'>
					{/* User Menu */}
					{isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='relative hover:bg-blue-50 dark:hover:bg-slate-800'
								>
									<User className='h-5 w-5 text-blue-600 dark:text-blue-400' />
									<span className='sr-only'>User menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-56'>
								<DropdownMenuLabel>{user?.name || 'Аккаунт'}</DropdownMenuLabel>
								<DropdownMenuLabel className='font-normal text-xs text-muted-foreground'>
									{user?.email}
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<Link href='/account'>
									<DropdownMenuItem className='cursor-pointer'>
										<Package className='h-4 w-4 mr-2' />
										Мои заказы
									</DropdownMenuItem>
								</Link>
								<Link href='/account/settings'>
									<DropdownMenuItem className='cursor-pointer'>
										<Settings className='h-4 w-4 mr-2' />
										Настройки аккаунта
									</DropdownMenuItem>
								</Link>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className='text-red-600 cursor-pointer'
								>
									<LogOut className='h-4 w-4 mr-2' />
									Выход
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className='flex items-center gap-1'>
							<Button
								variant='default'
								size='sm'
								asChild
								className='gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md'
							>
								<Link href='/login' className='flex items-center gap-2'>
									<LogIn className='h-4 w-4' />
									<span className='hidden sm:inline'>Вход</span>
								</Link>
							</Button>
						</div>
					)}

					{/* Cart */}
					<Button
						variant='ghost'
						size='icon'
						className='relative hover:bg-blue-50 dark:hover:bg-slate-800'
						asChild
					>
						<Link href='/cart'>
							<ShoppingCart className='h-5 w-5 text-blue-600 dark:text-blue-400' />
							{totalItems > 0 && (
								<Badge
									variant='destructive'
									className='absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold bg-linear-to-r from-red-500 to-red-600 shadow-md'
								>
									{totalItems > 99 ? '99+' : totalItems}
								</Badge>
							)}
							<span className='sr-only'>
								{totalItems > 0
									? `Cart (${totalItems} items)`
									: 'Cart is empty'}
							</span>
						</Link>
					</Button>
				</div>
			</div>
		</header>
	)
}
