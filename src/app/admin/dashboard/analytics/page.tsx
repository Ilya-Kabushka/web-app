'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Download, Package, ShoppingCart, Users } from 'lucide-react'
import CustomersTab from './components/CustomersTab'
import OverviewTab from './components/OverviewTab' // Пути к компонентам поправишь под свою структуру
import ProductsTab from './components/ProductsTab'
import RevenueTab from './components/RevenueTab'

export default function AnalyticsPage() {
	const handleExport = (format: 'csv' | 'json' | 'pdf') => {
		// TODO: Implement export functionality
		console.log(`Export to ${format} clicked`)
	}

	return (
		<div className='flex flex-col gap-6 p-8'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Аналитика</h1>
					<p className='text-muted-foreground mt-2'>
						Подробный отчет по продажам, клиентам и товарам.
					</p>
				</div>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => handleExport('csv')}
					>
						<Download className='w-4 h-4 mr-2' /> CSV
					</Button>
					{/* Оставим пока только CSV для компактности, потом добавишь остальные */}
				</div>
			</div>

			<Tabs defaultValue='overview' className='space-y-4'>
				<TabsList className='flex w-full justify-start overflow-x-auto'>
					<TabsTrigger value='overview' className='flex gap-2'>
						<BarChart3 className='w-4 h-4' /> Обзор
					</TabsTrigger>
					<TabsTrigger value='revenue' className='flex gap-2'>
						<ShoppingCart className='w-4 h-4' /> Выручка
					</TabsTrigger>
					<TabsTrigger value='customers' className='flex gap-2'>
						<Users className='w-4 h-4' /> Клиенты
					</TabsTrigger>
					<TabsTrigger value='products' className='flex gap-2'>
						<Package className='w-4 h-4' /> Товары
					</TabsTrigger>
					{/* Добавь остальные табы по аналогии */}
				</TabsList>

				<TabsContent value='overview' className='space-y-4'>
					<OverviewTab />
				</TabsContent>

				<TabsContent value='revenue' className='space-y-4'>
					<RevenueTab />
				</TabsContent>

				<TabsContent value='customers' className='space-y-4'>
					<CustomersTab />
				</TabsContent>

				<TabsContent value='products' className='space-y-4'>
					<ProductsTab />
				</TabsContent>
			</Tabs>
		</div>
	)
}
