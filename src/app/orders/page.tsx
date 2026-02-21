import { CancelOrderButton } from '@/components/CancelOrderButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/UpdateOrderStatusButton'
import { formatDateShort } from '@/lib/date-utils'
import { orderService } from '@/services/orders.service'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface OrdersPageProps {
	searchParams: {
		userId?: string
	}
}

export default async function UserOrdersPage({
	searchParams,
}: OrdersPageProps) {
	// ПРИМЕЧАНИЕ: Замените это на реальную систему аутентификации когда она будет реализована
	// Сейчас используется userId из query параметра для демонстрации
	const userId = searchParams.userId ? parseInt(searchParams.userId, 10) : 1

	const orders = await orderService.getByUserId(userId)

	return (
		<div className='space-y-6 p-6'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>Мои заказы</h1>
				<p className='text-muted-foreground'>
					Список всех ваших заказов и их статусы
				</p>
			</div>

			{orders.length === 0 ? (
				<Card>
					<CardContent className='flex flex-col items-center justify-center py-12'>
						<ShoppingCart className='h-12 w-12 text-muted-foreground/50 mb-4' />
						<p className='text-lg font-medium text-muted-foreground mb-2'>
							У вас пока нет заказов
						</p>
						<p className='text-sm text-muted-foreground mb-4'>
							Начните совершать покупки, чтобы видеть ваши заказы здесь
						</p>
						<Link href='/'>
							<Button variant='default'>Перейти в каталог</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<div className='grid gap-4'>
					{orders.map(order => (
						<Card key={order.id} className='hover:shadow-lg transition-shadow'>
							<CardContent className='p-6'>
								<div className='grid gap-4 md:grid-cols-5'>
									{/* ID и дата */}
									<div>
										<p className='text-sm text-muted-foreground'>
											Номер заказа
										</p>
										<p className='text-lg font-bold'>#{order.id}</p>
										<p className='text-xs text-muted-foreground mt-1'>
											{formatDateShort(order.createdAt)}
										</p>
									</div>

									{/* Товары */}
									<div>
										<p className='text-sm text-muted-foreground'>Товары</p>
										<p className='text-lg font-semibold'>
											{(order.orderItems as any[])?.length || 0} шт
										</p>
										<p className='text-xs text-muted-foreground mt-1'>
											{order.orderItems &&
												(order.orderItems as any[])
													?.slice(0, 2)
													.map((i: any) => i.product.name)
													.join(', ')}
											{((order.orderItems as any[])?.length || 0) > 2 && '...'}
										</p>
									</div>

									{/* Сумма */}
									<div>
										<p className='text-sm text-muted-foreground'>Сумма</p>
										<p className='text-lg font-bold'>
											{Number(order.totalPrice).toFixed(2)} BYN
										</p>
									</div>

									{/* Адрес */}
									<div>
										<p className='text-sm text-muted-foreground'>Адрес</p>
										<p className='text-sm font-medium'>{order.deliveryCity}</p>
										<p className='text-xs text-muted-foreground'>
											{order.deliveryStreet}
										</p>
									</div>

									{/* Статус и действия */}
									<div className='flex flex-col gap-2 justify-between'>
										<div>
											<p className='text-sm text-muted-foreground mb-1'>
												Статус
											</p>
											<OrderStatusBadge status={order.status} />
										</div>
										<div className='flex gap-2'>
											<Link href={`/orders/${order.id}`} className='flex-1'>
												<Button variant='outline' size='sm' className='w-full'>
													Детали
													<ArrowRight className='h-4 w-4 ml-2' />
												</Button>
											</Link>
											<CancelOrderButton
												orderId={order.id}
												canCancel={
													order.status === 'PENDING' ||
													order.status === 'PROCESSING'
												}
											/>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}
