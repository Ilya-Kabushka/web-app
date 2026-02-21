import { prisma } from '@/lib/prisma'

export const categoryService = {
	getAll: async () => {
		return await prisma.category.findMany({
			include: {
				categoryImage: true,
			},
		})
	},
	getById: async (id: number) => {
		return await prisma.category.findUnique({
			where: {
				id,
			},
		})
	},
	search: async (qwery: string) => {
		return await prisma.product.findMany({
			where: {
				name: {
					contains: qwery,
					mode: 'insensitive',
				},
			},
		})
	},
	create: async (data: {
		name: string
		description?: string
		parentCategoryId?: number
		imageUrl?: string // URL картинки от UploadThing
	}) => {
		return await prisma.category.create({
			data: {
				name: data.name,
				description: data.description,
				parentCategoryId: data.parentCategoryId || null,

				// Магия Prisma: создаем связанную запись в таблице category_images
				// только если передан imageUrl
				categoryImage: data.imageUrl
					? {
							create: {
								url: data.imageUrl,
							},
						}
					: undefined,
			},
			// Подключаем картинку в ответ, чтобы сразу её увидеть
			include: {
				categoryImage: true,
			},
		})
	},
	delete: async (id: number) => {
		return await prisma.category.delete({
			where: {
				id,
			},
		})
	},
}
