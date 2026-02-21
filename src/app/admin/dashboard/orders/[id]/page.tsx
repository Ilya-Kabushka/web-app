import { CancelOrderButton } from '@/components/CancelOrderButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UpdateOrderStatusButton } from '@/components/UpdateOrderStatusButton'
import { formatDateTime } from '@/lib/date-utils'
import { orderService } from '@/services/orders.service'
import { ArrowLeft, DollarSign, MapPin, ShoppingCart, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface OrderDetailsPageProps {
	params: {
		id: string
	}
}

export default async function OrderDetailsPage({
	params,
}: OrderDetailsPageProps) {
	const orderId = parseInt(params.id, 10)
	if (isNaN(orderId)) {
		notFound()
	}

	const order = await orderService.getById(orderId)
	if (!order) {
		notFound()
	}

	const canCancel = order.status === 'PENDING' || order.status === 'PROCESSING'

	return (
		<div className='space-y-6 p-6'>
			<Link href='/admin/dashboard/orders'>
				<Button variant='outline' size='sm'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Вернуться к заказам
				</Button>
			</Link>

			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>
						Заказ #{order.id}
					</h2>
					<p className='text-muted-foreground'>
						{formatDateTime(order.createdAt)}
					</p>
				</div>
				<div className='flex gap-2'>
					<UpdateOrderStatusButton
						orderId={order.id}
						currentStatus={order.status}
					/>
					<CancelOrderButton orderId={order.id} canCancel={canCancel} />
				</div>
			</div>

			<div className='grid gap-6 md:grid-cols-3'>
				{/* Информация о клиенте */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<User className='h-5 w-5' />
							Клиент
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2'>
						<div>
							<p className='text-sm text-muted-foreground'>ФИО</p>
							<p className='font-medium'>
								{order.user.firstName} {order.user.lastName}
							</p>
						</div>
						<div>
							<p className='text-sm text-muted-foreground'>Email</p>
							<p className='font-medium'>{order.user.email}</p>
						</div>
						<div>
							<p className='text-sm text-muted-foreground'>Всего потрачено</p>
							<p className='font-medium'>
								{Number(order.user.totalSpent).toFixed(2)} BYN
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Адрес доставки */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<MapPin className='h-5 w-5' />
							Адрес доставки
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2'>
						<div>
							<p className='text-sm text-muted-foreground'>Город</p>
							<p className='font-medium'>{order.deliveryCity}</p>
						</div>
						<div>
							<p className='text-sm text-muted-foreground'>Улица</p>
							<p className='font-medium'>{order.deliveryStreet}</p>
						</div>
					</CardContent>
				</Card>

				{/* Информация о платеже */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<DollarSign className='h-5 w-5' />
							Платеж
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2'>
						<div>
							<p className='text-sm text-muted-foreground'>Сумма</p>
							<p className='text-2xl font-bold'>
								{Number(order.totalPrice).toFixed(2)} BYN
							</p>
						</div>
						{order.promocode && (
							<div>
								<p className='text-sm text-muted-foreground'>Промокод</p>
								<p className='font-medium'>
									{order.promocode.code} ({Number(order.promocode.discount)}%)
								</p>
							</div>
						)}
						{order.paymentMethod && (
							<div>
								<p className='text-sm text-muted-foreground'>Способ оплаты</p>
								<p className='font-medium'>{order.paymentMethod.type}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Товары в заказе */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<ShoppingCart className='h-5 w-5' />
						Товары ({(order.orderItems as any[])?.length || 0})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{order.orderItems &&
							(order.orderItems as any[]).map((item: any) => (
								<div
									key={item.id}
									className='flex gap-4 pb-4 border-b last:border-b-0'
								>
									{/* Изображение товара */}
									<div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted'>
										{item.product.images && item.product.images.length > 0 ? (
											<Image
												src={item.product.images[0].url}
												alt={item.product.name}
												fill
												className='object-cover'
											/>
										) : (
											<div className='flex h-full w-full items-center justify-center'>
												<ShoppingCart className='h-6 w-6 text-muted-foreground/50' />
											</div>
										)}
									</div>

									{/* Информация о товаре */}
									<div className='flex-1'>
										<Link
											href={`/admin/dashboard/products`}
											className='text-lg font-semibold hover:underline'
										>
											{item.product.name}
										</Link>
										<p className='text-sm text-muted-foreground'>
											{item.product.description}
										</p>
										<div className='mt-2 flex gap-4'>
											<div>
												<p className='text-sm text-muted-foreground'>
													Количество
												</p>
												<p className='font-medium'>{item.quantity}</p>
											</div>
											<div>
												<p className='text-sm text-muted-foreground'>Цена</p>
												<p className='font-medium'>
													{Number(item.priceAtPurchase).toFixed(2)} BYN
												</p>
											</div>
											<div>
												<p className='text-sm text-muted-foreground'>Сумма</p>
												<p className='font-bold'>
													{(
														Number(item.priceAtPurchase) * item.quantity
													).toFixed(2)}{' '}
													BYN
												</p>
											</div>
										</div>
									</div>
								</div>
							))}
					</div>

					{/* Итоговая информация */}
					<div className='mt-6 border-t pt-4 flex justify-end'>
						<div className='w-full max-w-xs space-y-2'>
							<div className='flex justify-between text-sm'>
								<span className='text-muted-foreground'>Подитог:</span>
								<span>{Number(order.totalPrice).toFixed(2)} BYN</span>
							</div>
							{order.promocode && (
								<div className='flex justify-between text-sm text-green-600'>
									<span>Скидка ({Number(order.promocode.discount)}%):</span>
									<span>
										-
										{(
											(Number(order.totalPrice) *
												Number(order.promocode.discount)) /
											100
										).toFixed(2)}{' '}
										BYN
									</span>
								</div>
							)}
							<div className='flex justify-between text-lg font-bold border-t pt-2'>
								<span>Итого:</span>
								<span>{Number(order.totalPrice).toFixed(2)} BYN</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
