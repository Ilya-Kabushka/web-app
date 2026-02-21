import { AdminCreateOrderButton } from '@/components/AdminCreateOrderButton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { UpdateOrderStatusButton } from '@/components/UpdateOrderStatusButton'
import { formatDateShort } from '@/lib/date-utils'
import { prisma } from '@/lib/prisma'
import { orderService } from '@/services/orders.service'
import { DollarSign, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default async function OrdersPage() {
	// Получаем все заказы
	const orders = await orderService.getAll()
	const stats = await orderService.getStatistics()

	// Получаем покупателей (пользователи с ролью USER)
	const users = await prisma.user.findMany({
		where: { role: 'USER' },
		include: {
			addresses: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	// Получаем способы оплаты
	const paymentMethods = await prisma.paymentMethod.findMany()

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>Заказы</h2>
					<p className='text-muted-foreground'>
						Управление заказами клиентов и отслеживание их статусов.
					</p>
				</div>
				<AdminCreateOrderButton users={users} paymentMethods={paymentMethods} />
			</div>

			{/* Статистика */}
			<div className='grid gap-4 md:grid-cols-4'>
				<div className='rounded-lg border bg-card p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-muted-foreground'>Всего заказов</p>
							<p className='text-2xl font-bold'>{stats.totalOrders}</p>
						</div>
						<ShoppingCart className='h-8 w-8 text-muted-foreground/50' />
					</div>
				</div>

				<div className='rounded-lg border bg-card p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-muted-foreground'>Общая выручка</p>
							<p className='text-2xl font-bold'>
								{Number(stats.totalRevenue).toFixed(2)} BYN
							</p>
						</div>
						<DollarSign className='h-8 w-8 text-muted-foreground/50' />
					</div>
				</div>

				<div className='rounded-lg border bg-card p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-muted-foreground'>Средний заказ</p>
							<p className='text-2xl font-bold'>
								{Number(stats.averageOrderValue).toFixed(2)} BYN
							</p>
						</div>
						<DollarSign className='h-8 w-8 text-muted-foreground/50' />
					</div>
				</div>

				<div className='rounded-lg border bg-card p-4'>
					<div>
						<p className='text-sm text-muted-foreground mb-2'>По статусам</p>
						<div className='space-y-1'>
							{stats.ordersByStatus.map(status => (
								<div
									key={status.status}
									className='flex justify-between text-xs'
								>
									<span className='text-muted-foreground'>{status.status}</span>
									<span className='font-semibold'>{status._count.id}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Таблица заказов */}
			<div className='rounded-md border bg-card'>
				<Table>
					<TableHeader>
						<TableRow className='bg-muted/50'>
							<TableHead className='w-20'>ID</TableHead>
							<TableHead>Клиент</TableHead>
							<TableHead>Товары</TableHead>
							<TableHead>Сумма</TableHead>
							<TableHead>Адрес</TableHead>
							<TableHead>Дата</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead className='text-right'>Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={8}
									className='h-24 text-center text-muted-foreground'
								>
									Заказов пока нет.
								</TableCell>
							</TableRow>
						) : (
							orders.map(order => (
								<TableRow
									key={order.id}
									className='hover:bg-muted/50 transition-colors'
								>
									<TableCell className='font-medium'>#{order.id}</TableCell>
									<TableCell>
										<div className='flex flex-col gap-1'>
											<span className='font-medium text-sm'>
												{order.user.firstName} {order.user.lastName}
											</span>
											<span className='text-xs text-muted-foreground'>
												{order.user.email}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div className='flex flex-col gap-1'>
											{order.orderItems &&
												(order.orderItems as any[]).map((item: any) => (
													<span key={item.id} className='text-xs'>
														{item.product.name} ({item.quantity}x)
													</span>
												))}
											<span className='text-xs text-muted-foreground'>
												{(order.orderItems as any[])?.length || 0} товаров
											</span>
										</div>
									</TableCell>
									<TableCell className='font-semibold'>
										{Number(order.totalPrice).toFixed(2)} BYN
									</TableCell>
									<TableCell>
										<div className='flex flex-col gap-1 text-xs'>
											<span>{order.deliveryCity}</span>
											<span className='text-muted-foreground'>
												{order.deliveryStreet}
											</span>
										</div>
									</TableCell>
									<TableCell className='text-sm'>
										{formatDateShort(order.createdAt)}
									</TableCell>
									<TableCell>
										<UpdateOrderStatusButton
											orderId={order.id}
											currentStatus={order.status}
										/>
									</TableCell>
									<TableCell className='text-right'>
										<Link
											href={`/admin/dashboard/orders/${order.id}`}
											className='text-blue-600 hover:underline text-sm'
										>
											Детали
										</Link>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
