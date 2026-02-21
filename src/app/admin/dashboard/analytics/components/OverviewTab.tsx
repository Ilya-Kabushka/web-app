'use client'

import {
	LineChartComponent,
	PieChartComponent,
} from '@/components/charts/ChartComponents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	getAverageOrderValueAction,
	getDashboardStatsAction,
	getOrderStatusDistributionAction,
	getOrdersTrendLastMonthAction,
	getPromoUsagePercentAction,
} from '@/server-actions/analytics.action'
import { DollarSign, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function OverviewTab() {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState<any>({})

	useEffect(() => {
		const loadData = async () => {
			setLoading(true)
			try {
				const [stats, avgValue, promo, trend, status] = await Promise.all([
					getDashboardStatsAction(),
					getAverageOrderValueAction(),
					getPromoUsagePercentAction(),
					getOrdersTrendLastMonthAction(),
					getOrderStatusDistributionAction(),
				])

				setData({
					stats,
					avgValue: avgValue?.[0],
					promo: promo?.[0],
					trend,
					status,
				})
			} catch (error) {
				console.error('Failed to load overview data', error)
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [])

	if (loading) {
		return (
			<div className='h-40 flex items-center justify-center text-muted-foreground'>
				Загрузка данных обзора...
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Карточки статистики в стиле shadcn */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Всего заказов</CardTitle>
						<ShoppingCart className='w-4 h-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{data.stats?.totalOrders || 0}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Общая выручка</CardTitle>
						<DollarSign className='w-4 h-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							₽{Number(data.stats?.totalRevenue || 0).toLocaleString('ru-RU')}
						</div>
					</CardContent>
				</Card>
				{/* Добавь еще две карточки (Средний чек и Промокоды) по этому же шаблону */}
			</div>

			{/* Графики */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				<Card>
					<CardHeader>
						<CardTitle>Тренд заказов</CardTitle>
					</CardHeader>
					<CardContent>
						<LineChartComponent
							data={
								data.trend?.map((item: any) => ({
									date: new Date(item.date).toLocaleDateString('ru-RU'),
									count: parseInt(item.count),
								})) || []
							}
							dataKey='count'
							nameKey='date'
							title='' // Убираем заголовок внутри графика, так как он есть в CardTitle
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Статусы заказов</CardTitle>
					</CardHeader>
					<CardContent>
						<PieChartComponent
							data={
								data.status?.map((item: any) => ({
									name: item.status,
									value: parseInt(item.count),
								})) || []
							}
							dataKey='value'
							nameKey='name'
							title=''
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
