'use client'

import { BarChartComponent } from '@/components/charts/ChartComponents'
import { DataTable } from '@/components/charts/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	getAverageRatingByCategoryAction,
	getTopRatedProductsAction,
	getUnorderedProductsAction,
} from '@/server-actions/analytics.action'
import { useEffect, useState } from 'react'

export default function ProductsTab() {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState<any>({})

	useEffect(() => {
		const loadData = async () => {
			try {
				const [topRated, unordered, ratings] = await Promise.all([
					getTopRatedProductsAction(),
					getUnorderedProductsAction(),
					getAverageRatingByCategoryAction(),
				])
				setData({ topRated, unordered, ratings })
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [])

	if (loading)
		return <div className='p-8 text-center'>Загрузка данных о товарах...</div>

	return (
		<div className='grid gap-6'>
			<Card>
				<CardHeader>
					<CardTitle>Средний рейтинг по категориям</CardTitle>
				</CardHeader>
				<CardContent>
					<BarChartComponent
						data={
							data.ratings?.map((item: any) => ({
								name: item.category_name,
								rating: parseFloat(item.average_rating),
							})) || []
						}
						dataKey='rating'
						nameKey='name'
						title=''
					/>
				</CardContent>
			</Card>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				<Card>
					<CardHeader>
						<CardTitle>Товары с лучшим рейтингом</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							data={data.topRated || []}
							columns={[
								{ key: 'name', label: 'Товар' },
								{ key: 'average_rating', label: 'Рейтинг' },
							]}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Непопулярные товары (0 заказов)</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							data={data.unordered || []}
							columns={[{ key: 'name', label: 'Название' }]}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
