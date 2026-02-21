import {
	BarChart3,
	FolderTree,
	LayoutDashboard,
	Package,
	ShoppingCart,
	Users,
	Warehouse,
} from 'lucide-react'

export const MENU_ADMIN = [
	{ href: '/admin', icon: LayoutDashboard, label: 'Дашборд' },
	{ href: '/admin/dashboard/analytics', icon: BarChart3, label: 'Аналитика' },
	{ href: '/admin/dashboard/categories', icon: FolderTree, label: 'Категории' },
	{ href: '/admin/dashboard/products', icon: Package, label: 'Товары' },
	{ href: '/admin/dashboard/orders', icon: ShoppingCart, label: 'Заказы' },
	{ href: '/admin/dashboard/warehouses', icon: Warehouse, label: 'Склады' },
	{ href: '/admin/dashboard/users', icon: Users, label: 'Пользователи' },
]
