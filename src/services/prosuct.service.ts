import { prisma } from '@/lib/prisma'

export const productService = {
	getAll: async () => {
		try {
			return await prisma.product.findMany({
				orderBy: { createdAt: 'desc' },
				include: {
					category: true,
					images: true,
					stocks: {
						include: {
							warehouse: true,
						},
					},
					 productVariants: true, // Временно отключено до перегенерации Prisma клиента
				},
			})
		} catch (error) {
			console.error('Error fetching products:', error)
			throw error
		}
	},
	getById: async (id: number) => {
		try {
			return await prisma.product.findUnique({
				where: { id },
				include: {
					category: true,
					images: true,
					stocks: {
						include: {
							warehouse: true,
						},
					},
					productVariants: {
						include: {
							variantAttributeValues: {
								include: {
									attributeValue: {
										include: {
											attribute: true,
										},
									},
								},
							},
						},
					},
					attributeValues: {
						include: {
							attribute: true,
						},
					},
				},
			})
		} catch (error) {
			console.error('Error fetching product:', error)
			throw error
		}
	},
	create: async (data: {
		name: string
		description?: string
		basePrice: number
		categoryId: number
		isAvailable?: boolean
		hasVariants?: boolean
		imageUrls?: string[]
		variants?: Array<{
			name: string
			additionalPrice: number
			stock: number
			price: number
		}>
		stocks?: Array<{
			warehouseId: number
			quantity: number
		}>
	}) => {
		try {
			return await prisma.product.create({
				data: {
					name: data.name,
					description: data.description,
					basePrice: data.basePrice,
					categoryId: data.categoryId,
					isAvailable: data.isAvailable ?? true,
					hasVariants: data.hasVariants ?? false,
					averageRating: 0, // Новый товар еще не имеет отзывов
					images: data.imageUrls
						? {
								create: data.imageUrls.map((url, index) => ({
									url,
									isPrimary: index === 0,
								})),
							}
						: undefined,
					productVariants: data.variants
						? {
								create: data.variants.map(variant => ({
									name: variant.name,
									additionalPrice: variant.additionalPrice,
									stock: variant.stock,
									price: variant.price,
								})),
							}
						: undefined,
					stocks: data.stocks
						? {
								create: data.stocks.map(stock => ({
									warehouseId: stock.warehouseId,
									quantity: stock.quantity,
								})),
							}
						: undefined,
				},
				include: {
					category: true,
					images: true,
					stocks: {
						include: {
							warehouse: true,
						},
					},
					productVariants: true,
				},
			})
		} catch (error) {
			console.error('Error creating product:', error)
			throw error
		}
	},
	update: async (
		id: number,
		data: {
			name?: string
			description?: string
			basePrice?: number
			categoryId?: number
			isAvailable?: boolean
			hasVariants?: boolean
			imageUrls?: string[]
			variants?: Array<{
				id?: number
				name: string
				additionalPrice: number
				stock: number
				price: number
			}>
			stocks?: Array<{
				warehouseId: number
				quantity: number
			}>
		},
	) => {
		try {
			// Если переданы новые изображения, удаляем старые и создаем новые
			if (data.imageUrls !== undefined) {
				await prisma.productImage.deleteMany({
					where: { productId: id },
				})
			}

			// Если переданы варианты, удаляем старые и создаем новые
			if (data.variants !== undefined) {
				await prisma.productVariant.deleteMany({
					where: { productId: id },
				})
			}

			// Если переданы остатки, обновляем их через upsert
			if (data.stocks !== undefined) {
				// Удаляем все старые остатки
				await prisma.stock.deleteMany({
					where: { productId: id },
				})
			}

			return await prisma.product.update({
				where: { id },
				data: {
					name: data.name,
					description: data.description,
					basePrice: data.basePrice,
					categoryId: data.categoryId,
					isAvailable: data.isAvailable,
					hasVariants: data.hasVariants,
					images:
						data.imageUrls && data.imageUrls.length > 0
							? {
									create: data.imageUrls.map((url, index) => ({
										url,
										isPrimary: index === 0,
									})),
								}
							: undefined,
					productVariants:
						data.variants && data.variants.length > 0
							? {
									create: data.variants.map(variant => ({
										name: variant.name,
										additionalPrice: variant.additionalPrice,
										stock: variant.stock,
										price: variant.price,
									})),
								}
							: undefined,
					stocks:
						data.stocks && data.stocks.length > 0
							? {
									create: data.stocks.map(stock => ({
										warehouseId: stock.warehouseId,
										quantity: stock.quantity,
									})),
								}
							: undefined,
				},
				include: {
					category: true,
					images: true,
					stocks: {
						include: {
							warehouse: true,
						},
					},
					productVariants: true,
				},
			})
		} catch (error) {
			console.error('Error updating product:', error)
			throw error
		}
	},
	delete: async (id: number) => {
		try {
			return await prisma.product.delete({
				where: { id },
			})
		} catch (error) {
			console.error('Error deleting product:', error)
			throw error
		}
	},
}
