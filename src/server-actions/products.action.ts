'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { productService } from '@/services/prosuct.service'

export async function toggleProductAvailabilityAction(
	id: number,
	currentStatus: boolean,
) {
	try {
		await prisma.product.update({
			where: { id },
			data: {
				isAvailable: !currentStatus,
			},
		})

		revalidatePath('/admin/dashboard/products')
		return { success: true }
	} catch (error) {
		console.error('Toggle availability error:', error)
		return { error: 'Не удалось изменить статус товара' }
	}
}

export async function manageProductAction(formData: FormData) {
	const id = formData.get('id') as string | null
	const name = formData.get('name') as string
	const description = formData.get('description') as string
	const basePrice = formData.get('basePrice') as string
	const categoryId = formData.get('categoryId') as string
	const isAvailable = formData.get('isAvailable') === 'true' || formData.get('isAvailable') === 'on'
	const hasVariants = formData.get('hasVariants') === 'true' || formData.get('hasVariants') === 'on'
	const imageUrls = formData.get('imageUrls') as string | null
	const variantsJson = formData.get('variants') as string | null
	const stocksJson = formData.get('stocks') as string | null

	if (!name || !basePrice || !categoryId) {
		return { error: 'Название, цена и категория обязательны' }
	}

	try {
		const imageUrlsArray = imageUrls ? JSON.parse(imageUrls) : []
		const variants = variantsJson ? JSON.parse(variantsJson) : []
		const stocks = stocksJson ? JSON.parse(stocksJson) : []

		// Валидация вариантов
		if (hasVariants && variants.length === 0) {
			return { error: 'Для товара с вариантами необходимо добавить хотя бы один вариант' }
		}

		// Валидация остатков
		const validStocks = stocks.filter(
			(stock: { warehouseId: number; quantity: number }) =>
				stock.warehouseId && stock.quantity !== undefined && stock.quantity >= 0,
		)

		if (id) {
			// Обновление
			await productService.update(Number(id), {
				name,
				description: description || undefined,
				basePrice: Number(basePrice),
				categoryId: Number(categoryId),
				isAvailable,
				hasVariants,
				imageUrls: imageUrlsArray.length > 0 ? imageUrlsArray : undefined,
				variants: variants.length > 0 ? variants : undefined,
				stocks: validStocks.length > 0 ? validStocks : undefined,
			})
		} else {
			// Создание
			await productService.create({
				name,
				description: description || undefined,
				basePrice: Number(basePrice),
				categoryId: Number(categoryId),
				isAvailable,
				hasVariants,
				imageUrls: imageUrlsArray.length > 0 ? imageUrlsArray : undefined,
				variants: variants.length > 0 ? variants : undefined,
				stocks: validStocks.length > 0 ? validStocks : undefined,
			})
		}

		revalidatePath('/admin/dashboard/products')
		return { success: true }
	} catch (error: any) {
		console.error('Manage product error:', error)
		if (error.code === 'P2002') {
			return { error: 'Товар с таким названием уже существует' }
		}
		return { error: 'Ошибка при сохранении товара' }
	}
}

export async function deleteProductAction(id: number) {
	try {
		await productService.delete(id)
		revalidatePath('/admin/dashboard/products')
		return { success: true }
	} catch (error: any) {
		console.error('Delete product error:', error)
		// Проверяем ошибку триггера о защите от удаления
		if (error.message?.includes('активном заказе')) {
			return { error: 'Нельзя удалить товар, который находится в обработке в активном заказе!' }
		}
		return { error: 'Ошибка при удалении товара' }
	}
}
