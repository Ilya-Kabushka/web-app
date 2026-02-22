import { prisma } from '@/lib/prisma'

/**
 * Сервис для работы с функциями и процедурами PostgreSQL
 */
export const dbFunctionsService = {
	/**
	 * Получить сумму корзины через функцию БД
	 */
	getCartTotal: async (cartId: number): Promise<number> => {
		try {
			const result = await prisma.$queryRaw<Array<{ get_cart_total: number }>>`
				SELECT get_cart_total(${cartId}) as get_cart_total
			`
			return Number(result[0]?.get_cart_total || 0)
		} catch (error) {
			console.error('Error getting cart total:', error)
			throw error
		}
	},

	/**
	 * Проверить активность промокода
	 */
	isPromoActive: async (promocodeId: number): Promise<boolean> => {
		try {
			const result = await prisma.$queryRaw<Array<{ is_promo_active: boolean }>>`
				SELECT is_promo_active(${promocodeId}) as is_promo_active
			`
			return result[0]?.is_promo_active || false
		} catch (error) {
			console.error('Error checking promo:', error)
			return false
		}
	},

	/**
	 * Получить общий остаток товара на всех складах
	 */
	getTotalStock: async (productId: number): Promise<number> => {
		try {
			const result = await prisma.$queryRaw<Array<{ get_total_stock: number }>>`
				SELECT get_total_stock(${productId}) as get_total_stock
			`
			return Number(result[0]?.get_total_stock || 0)
		} catch (error) {
			console.error('Error getting total stock:', error)
			return 0
		}
	},

	/**
	 * Проверить VIP статус пользователя
	 */
	isUserVip: async (userId: number): Promise<boolean> => {
		try {
			const result = await prisma.$queryRaw<Array<{ is_user_vip: boolean }>>`
				SELECT is_user_vip(${userId}) as is_user_vip
			`
			return result[0]?.is_user_vip || false
		} catch (error) {
			console.error('Error checking VIP status:', error)
			return false
		}
	},

	/**
	 * Оценить дни доставки
	 */
	estimateDeliveryDays: async (cityName: string): Promise<number> => {
		try {
			const result = await prisma.$queryRaw<Array<{ estimate_delivery_days: number }>>`
				SELECT estimate_delivery_days(${cityName}) as estimate_delivery_days
			`
			return Number(result[0]?.estimate_delivery_days || 3)
		} catch (error) {
			console.error('Error estimating delivery:', error)
			return 3 // По умолчанию 3 дня
		}
	},

	/**
	 * Получить полный адрес
	 */
	getFullAddress: async (addressId: number): Promise<string> => {
		try {
			const result = await prisma.$queryRaw<Array<{ get_full_address: string }>>`
				SELECT get_full_address(${addressId}) as get_full_address
			`
			return result[0]?.get_full_address || ''
		} catch (error) {
			console.error('Error getting full address:', error)
			return ''
		}
	},

	/**
	 * Создать заказ из корзины через процедуру БД
	 */
	createOrderFromCart: async (
		userId: number,
		addressId: number,
	): Promise<{ orderId: number }> => {
		try {
			await prisma.$executeRaw`
				CALL create_order_from_cart(${userId}, ${addressId})
			`

			// Получаем созданный заказ
			const order = await prisma.order.findFirst({
				where: {
					userId,
					addressId,
				},
				orderBy: {
					createdAt: 'desc',
				},
			})

			if (!order) {
				throw new Error('Заказ не был создан')
			}

			return { orderId: order.id }
		} catch (error) {
			console.error('Error creating order from cart:', error)
			throw error
		}
	},

	/**
	 * Инициализировать корзину пользователя
	 */
	initUserCart: async (userId: number): Promise<void> => {
		try {
			await prisma.$executeRaw`
				CALL init_user_cart(${userId})
			`
		} catch (error) {
			console.error('Error initializing cart:', error)
			// Игнорируем ошибку если корзина уже существует
		}
	},
}

