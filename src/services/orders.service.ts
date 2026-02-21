import { prisma } from '@/lib/prisma'

export const orderService = {
	// Получить все заказы (для админа)
	getAll: async () => {
		return await prisma.order.findMany({
			include: {
				user: true,
				orderItems: {
					include: {
						product: {
							include: {
								images: {
									where: { isPrimary: true },
									take: 1,
								},
							},
						},
					},
				},
				promocode: true,
				paymentMethod: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
	},

	// Получить заказы пользователя
	getByUserId: async (userId: number) => {
		return await prisma.order.findMany({
			where: { userId },
			include: {
				orderItems: {
					include: {
						product: {
							include: {
								images: {
									where: { isPrimary: true },
									take: 1,
								},
							},
						},
					},
				},
				promocode: true,
				paymentMethod: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
	},

	// Получить детали заказа
	getById: async (id: number) => {
		return await prisma.order.findUnique({
			where: { id },
			include: {
				user: {
					include: {
						addresses: true,
					},
				},
				orderItems: {
					include: {
						product: {
							include: {
								images: true,
								category: true,
							},
						},
					},
				},
				promocode: true,
				paymentMethod: true,
			},
		})
	},

	// Создать заказ из корзины
	createFromCart: async (data: {
		userId: number
		addressId?: number
		deliveryCity: string
		deliveryStreet: string
		promocodeId?: number
		paymentMethodId?: number
		items: {
			productId: number
			quantity: number
			priceAtPurchase: number
		}[]
	}) => {
		// Рассчитываем общую сумму
		const totalPrice = data.items.reduce(
			(sum, item) => sum + item.priceAtPurchase * item.quantity,
			0,
		)

		const order = await prisma.order.create({
			data: {
				userId: data.userId,
				totalPrice,
				status: 'PENDING',
				deliveryCity: data.deliveryCity,
				deliveryStreet: data.deliveryStreet,
				addressId: data.addressId,
				promocodeId: data.promocodeId,
				paymentMethodId: data.paymentMethodId,
				orderItems: {
					create: data.items.map(item => ({
						productId: item.productId,
						quantity: item.quantity,
						priceAtPurchase: item.priceAtPurchase,
					})),
				},
			},
			include: {
				orderItems: {
					include: {
						product: true,
					},
				},
				user: true,
			},
		})

		return order
	},

	// Обновить статус заказа
	updateStatus: async (orderId: number, status: string) => {
		return await prisma.order.update({
			where: { id: orderId },
			data: { status: status as any },
			include: {
				user: true,
				orderItems: {
					include: {
						product: true,
					},
				},
			},
		})
	},

	// Отменить заказ
	cancel: async (orderId: number) => {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
		})

		if (!order) {
			throw new Error('Заказ не найден')
		}

		if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
			throw new Error('Невозможно отменить заказ с этим статусом')
		}

		return await prisma.order.update({
			where: { id: orderId },
			data: { status: 'CANCELED' },
		})
	},

	// Получить статистику заказов
	getStatistics: async () => {
		const [totalOrders, ordersByStatus, totalRevenue, averageOrderValue] =
			await Promise.all([
				// Всего заказов
				prisma.order.count(),
				// Заказы по статусам
				prisma.order.groupBy({
					by: ['status'],
					_count: {
						id: true,
					},
				}),
				// Общая выручка
				prisma.order.aggregate({
					_sum: {
						totalPrice: true,
					},
				}),
				// Средняя сумма заказа
				prisma.order.aggregate({
					_avg: {
						totalPrice: true,
					},
				}),
			])

		return {
			totalOrders,
			ordersByStatus,
			totalRevenue: totalRevenue._sum.totalPrice || 0,
			averageOrderValue: averageOrderValue._avg.totalPrice || 0,
		}
	},

	// Поиск заказов по номеру или пользователю
	search: async (query: string) => {
		// Пытаемся парсить как число (ID заказа)
		const orderId = parseInt(query, 10)

		return await prisma.order.findMany({
			where: {
				OR: [
					{
						id: !isNaN(orderId) ? orderId : undefined,
					},
					{
						user: {
							email: {
								contains: query,
								mode: 'insensitive',
							},
						},
					},
					{
						user: {
							firstName: {
								contains: query,
								mode: 'insensitive',
							},
						},
					},
					{
						user: {
							lastName: {
								contains: query,
								mode: 'insensitive',
							},
						},
					},
				],
			},
			include: {
				user: true,
				orderItems: {
					include: {
						product: true,
					},
				},
			},
		})
	},
}
