'use client'

import {
	BarChartComponent,
	LineChartComponent,
} from '@/components/charts/ChartComponents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	getMonthlyRevenueAction,
	getTopCategoriesByRevenueAction,
} from '@/server-actions/analytics.action'
import { useEffect, useState } from 'react'

export default function RevenueTab() {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState<any>({})

	useEffect(() => {
		const loadData = async () => {
			try {
				const [monthly, categories] = await Promise.all([
					getMonthlyRevenueAction(),
					getTopCategoriesByRevenueAction(),
				])
				setData({ monthly, categories })
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [])

	if (loading)
		return <div className='p-8 text-center'>Загрузка данных по выручке...</div>

	return (
		<div className='grid gap-6'>
			<Card>
				<CardHeader>
					<CardTitle>Динамика выручки по месяцам</CardTitle>
				</CardHeader>
				<CardContent>
					<LineChartComponent
						data={
							data.monthly?.map((item: any) => ({
								month: new Date(item.month).toLocaleDateString('ru-RU', {
									month: 'long',
									year: 'numeric',
								}),
								revenue: parseFloat(item.revenue),
							})) || []
						}
						dataKey='revenue'
						nameKey='month'
						title=''
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Топ-5 категорий по выручке</CardTitle>
				</CardHeader>
				<CardContent>
					<BarChartComponent
						data={
							data.categories?.map((item: any) => ({
								name: item.name,
								выручка: parseFloat(item.revenue),
							})) || []
						}
						dataKey='выручка'
						nameKey='name'
						title=''
					/>
				</CardContent>
			</Card>
		</div>
	)
}
