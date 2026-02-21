'use server'

import { prisma } from '@/lib/prisma'
import { categoryService } from '@/services/categories.service'
import { revalidatePath } from 'next/cache'

export async function createCategoryAction(formData: FormData) {
	const name = formData.get('name') as string
	const description = formData.get('description') as string
	const parentId = formData.get('parentCategoryId')
	const imageUrl = formData.get('imageUrl') as string

	if (!name) {
		return { error: 'Название категории обязательно' }
	}

	try {
		await categoryService.create({
			name,
			description,
			parentCategoryId: parentId ? Number(parentId) : undefined,
			imageUrl,
		})

		// Обновляем кэш страницы, где отображается список категорий
		revalidatePath('/admin/categories')

		return { success: true }
	} catch (error) {
		console.error('Ошибка создания категории:', error)
		return { error: 'Не удалось создать категорию' }
	}
}
export async function manageCategoryAction(formData: FormData) {
	const id = formData.get('id') as string | null
	const name = formData.get('name') as string
	const description = formData.get('description') as string
	const parentCategoryId = formData.get('parentCategoryId') as string
	const imageUrl = formData.get('imageUrl') as string

	if (!name) {
		return { error: 'Название категории обязательно' }
	}

	try {
		const parentId = parentCategoryId === '0' ? null : Number(parentCategoryId)

		if (id) {
			// Логика ОБНОВЛЕНИЯ
			await prisma.category.update({
				where: { id: Number(id) },
				data: {
					name,
					description,
					parentCategoryId: parentId,
					categoryImage: imageUrl
						? {
								upsert: {
									create: { url: imageUrl },
									update: { url: imageUrl },
								},
							}
						: undefined,
				},
			})
		} else {
			// Логика СОЗДАНИЯ
			await prisma.category.create({
				data: {
					name,
					description,
					parentCategoryId: parentId,
					categoryImage: imageUrl
						? {
								create: { url: imageUrl },
							}
						: undefined,
				},
			})
		}

		// Обновляем данные на странице категорий
		revalidatePath('/admin/categories')
		return { success: true }
	} catch (error: any) {
		if (error.code === 'P2002') {
			return { error: 'Категория с таким названием уже существует' }
		}
		return { error: 'Ошибка при сохранении категории' }
	}
}
export async function deleteCategoryAction(id: number) {
	try {
		await prisma.category.delete({
			where: { id },
		})

		// Обновляем страницу, чтобы запись исчезла из таблицы
		revalidatePath('/admin/dashboard/categories')
		return { success: true }
	} catch (error) {
		console.error('Delete error:', error)
		return {
			error:
				'Не удалось удалить категорию. Возможно, она связана с продуктами.',
		}
	}
}
