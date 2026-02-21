import { CancelOrderButton } from '@/components/CancelOrderButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/UpdateOrderStatusButton'
import { orderService } from '@/services/orders.service'
import { ArrowLeft, DollarSign, MapPin, ShoppingCart } from 'lucide-react'
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
			<Link href='/orders'>
				<Button variant='outline' size='sm'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Вернуться к заказам
				</Button>
			</Link>

			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						Заказ #{order.id}
					</h1>
					<p className='text-muted-foreground'>
						{formatDateTime(order.createdAt)}
					</p>
				</div>
				<div className='flex gap-2'>
					<OrderStatusBadge status={order.status} />
					<CancelOrderButton orderId={order.id} canCancel={canCancel} />
				</div>
			</div>

			<div className='grid gap-6 md:grid-cols-2'>
				{/* Информация о доставке */}
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
							Информация о платеже
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2'>
						<div>
							<p className='text-sm text-muted-foreground'>Общая сумма</p>
							<p className='text-2xl font-bold'>
								{Number(order.totalPrice).toFixed(2)} BYN
							</p>
						</div>
						{order.promocode && (
							<div className='border-t pt-2'>
								<p className='text-sm text-muted-foreground'>
									Применен промокод
								</p>
								<p className='font-medium'>
									{order.promocode.code} (-{order.promocode.discount}%)
								</p>
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
						Товары ({order.orderItems.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{order.orderItems.map(item => (
							<div
								key={item.id}
								className='flex gap-4 pb-4 border-b last:border-b-0'
							>
								{/* Изображение товара */}
								<div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted'>
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
								<div className='flex-1 min-w-0'>
									<Link
										href={`/[product]/${item.product.id}`}
										className='font-semibold hover:underline line-clamp-2'
									>
										{item.product.name}
									</Link>
									<p className='text-sm text-muted-foreground line-clamp-1'>
										{item.product.description}
									</p>
									<div className='mt-2 flex gap-4 flex-wrap'>
										<div>
											<p className='text-xs text-muted-foreground'>
												Количество
											</p>
											<p className='font-medium'>{item.quantity}</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Цена</p>
											<p className='font-medium'>
												{Number(item.priceAtPurchase).toFixed(2)} BYN
											</p>
										</div>
										<div>
											<p className='text-xs text-muted-foreground'>Всего</p>
											<p className='font-bold'>
												{(Number(item.priceAtPurchase) * item.quantity).toFixed(
													2,
												)}{' '}
												BYN
											</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Итоговая сумма */}
					<div className='mt-6 border-t pt-4'>
						<div className='flex justify-end'>
							<div className='w-full max-w-xs space-y-2'>
								<div className='flex justify-between text-sm'>
									<span>Подитог:</span>
									<span>{Number(order.totalPrice).toFixed(2)} BYN</span>
								</div>
								{order.promocode && (
									<div className='flex justify-between text-sm text-green-600'>
										<span>Скидка ({order.promocode.discount}%):</span>
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
								<div className='flex justify-between font-bold border-t pt-2'>
									<span>Итого к оплате:</span>
									<span>{Number(order.totalPrice).toFixed(2)} BYN</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
