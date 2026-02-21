'use server'

import { prisma } from '@/lib/prisma'
import { orderService } from '@/services/orders.service'
import { revalidatePath } from 'next/cache'

// Создать заказ из корзины
export async function createOrderAction(
	userId: number,
	addressId: number,
	paymentMethodId?: number,
	promocodeCode?: string,
) {
	try {
		// Получаем корзину пользователя
		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		})

		if (!cart || cart.items.length === 0) {
			return { error: 'Корзина пуста' }
		}

		// Получаем адрес доставки
		const address = await prisma.address.findUnique({
			where: { id: addressId },
		})

		if (!address) {
			return { error: 'Адрес доставки не найден' }
		}

		// Проверяем промокод если указан
		let promocodeId: number | undefined
		if (promocodeCode) {
			const promo = await prisma.promocode.findUnique({
				where: { code: promocodeCode },
			})

			if (!promo) {
				return { error: 'Промокод не найден' }
			}

			if (new Date() > promo.validUntil) {
				return { error: 'Промокод больше не действителен' }
			}

			promocodeId = promo.id
		}

		// Создаем заказ с позициями из корзины
		const order = await orderService.createFromCart({
			userId,
			addressId,
			deliveryCity: address.city,
			deliveryStreet: address.street,
			promocodeId,
			paymentMethodId,
			items: cart.items.map(item => ({
				productId: item.productId,
				quantity: item.quantity,
				priceAtPurchase: Number(item.product.basePrice),
			})),
		})

		// Очищаем корзину
		await prisma.cartItem.deleteMany({
			where: { cartId: cart.id },
		})

		revalidatePath('/orders')
		revalidatePath('/admin/dashboard/orders')

		return { success: true, orderId: order.id }
	} catch (error) {
		console.error('Create order error:', error)
		return { error: 'Не удалось создать заказ' }
	}
}

// Изменить статус заказа
export async function updateOrderStatusAction(orderId: number, status: string) {
	try {
		await orderService.updateStatus(orderId, status)
		revalidatePath('/admin/dashboard/orders')
		return { success: true }
	} catch (error) {
		console.error('Update order status error:', error)
		return { error: 'Не удалось обновить статус заказа' }
	}
}

// Отменить заказ
export async function cancelOrderAction(orderId: number) {
	try {
		await orderService.cancel(orderId)
		revalidatePath('/orders')
		revalidatePath('/admin/dashboard/orders')
		return { success: true }
	} catch (error) {
		console.error('Cancel order error:', error)
		return {
			error:
				error instanceof Error ? error.message : 'Не удалось отменить заказ',
		}
	}
}

// Получить детали заказа
export async function getOrderDetailsAction(orderId: number) {
	try {
		const order = await orderService.getById(orderId)
		if (!order) {
			return { error: 'Заказ не найден' }
		}
		return { success: true, order }
	} catch (error) {
		console.error('Get order details error:', error)
		return { error: 'Не удалось получить детали заказа' }
	}
}

// Получить заказы пользователя
export async function getUserOrdersAction(userId: number) {
	try {
		const orders = await orderService.getByUserId(userId)
		return { success: true, orders }
	} catch (error) {
		console.error('Get user orders error:', error)
		return { error: 'Не удалось получить заказы' }
	}
}
