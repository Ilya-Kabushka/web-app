'use client'

import { LineChartComponent } from '@/components/charts/ChartComponents'
import { DataTable } from '@/components/charts/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	getAboveAverageSpendersAction,
	getActiveReviewersAction,
	getUserRegistrationDynamicsAction,
} from '@/server-actions/analytics.action'
import { useEffect, useState } from 'react'

export default function CustomersTab() {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState<any>({})

	useEffect(() => {
		const loadData = async () => {
			try {
				const [spenders, dynamics, reviewers] = await Promise.all([
					getAboveAverageSpendersAction(),
					getUserRegistrationDynamicsAction(),
					getActiveReviewersAction(),
				])
				setData({ spenders, dynamics, reviewers })
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [])

	if (loading)
		return <div className='p-8 text-center'>Загрузка данных о клиентах...</div>

	return (
		<div className='grid gap-6'>
			<Card>
				<CardHeader>
					<CardTitle>Динамика регистраций</CardTitle>
				</CardHeader>
				<CardContent>
					<LineChartComponent
						data={
							data.dynamics?.map((item: any) => ({
								month: new Date(item.month).toLocaleDateString('ru-RU', {
									month: 'short',
									year: 'numeric',
								}),
								users: parseInt(item.new_users),
							})) || []
						}
						dataKey='users'
						nameKey='month'
						title=''
					/>
				</CardContent>
			</Card>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				<Card>
					<CardHeader>
						<CardTitle>Топ покупателей (выше среднего)</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							data={data.spenders || []}
							columns={[
								{ key: 'first_name', label: 'Имя' },
								{ key: 'total_spent', label: 'Потрачено (₽)' },
							]}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Активные рецензенты</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable
							data={data.reviewers || []}
							columns={[
								{ key: 'email', label: 'Email' },
								{ key: 'review_count', label: 'Отзывов' },
							]}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
