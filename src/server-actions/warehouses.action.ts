'use server'

import { prisma } from '@/lib/prisma'
import { warehouseService } from '@/services/warehouses.service'
import { revalidatePath } from 'next/cache'

export async function manageWarehouseAction(formData: FormData) {
	const id = formData.get('id') as string | null
	const name = formData.get('name') as string
	const location = formData.get('location') as string

	if (!name || !location) {
		return { error: 'Название и адрес склада обязательны' }
	}

	try {
		if (id) {
			// Обновление
			await warehouseService.update(Number(id), { name, location })
		} else {
			// Создание
			await warehouseService.create({ name, location })
		}

		revalidatePath('/admin/dashboard/warehouses')
		return { success: true }
	} catch (error: any) {
		console.error('Ошибка при сохранении склада:', error)
		return { error: 'Ошибка при сохранении склада' }
	}
}

export async function deleteWarehouseAction(id: number) {
	try {
		await warehouseService.delete(id)
		revalidatePath('/admin/dashboard/warehouses')
		return { success: true }
	} catch (error) {
		console.error('Ошибка удаления склада:', error)
		return {
			error:
				'Не удалось удалить склад. Возможно, он связан с товарами или сотрудниками.',
		}
	}
}

export async function addWorkerToWarehouseAction(
	warehouseId: number,
	userId: number,
) {
	try {
		await warehouseService.addWorker(warehouseId, userId)
		revalidatePath('/admin/dashboard/warehouses')
		return { success: true }
	} catch (error: any) {
		console.error('Ошибка добавления сотрудника:', error)
		if (error.code === 'P2002') {
			return { error: 'Сотрудник уже закреплен за этим складом' }
		}
		return { error: 'Ошибка при добавлении сотрудника' }
	}
}

export async function removeWorkerFromWarehouseAction(
	warehouseId: number,
	userId: number,
) {
	try {
		await warehouseService.removeWorker(warehouseId, userId)
		revalidatePath('/admin/dashboard/warehouses')
		return { success: true }
	} catch (error) {
		console.error('Ошибка удаления сотрудника:', error)
		return { error: 'Ошибка при удалении сотрудника' }
	}
}

export async function getWarehouseWorkersAction(warehouseId: number) {
	try {
		const workers = await warehouseService.getWarehouseWorkers(warehouseId)
		return { success: true, workers }
	} catch (error) {
		console.error('Ошибка получения сотрудников:', error)
		return { error: 'Ошибка при получении сотрудников' }
	}
}

export async function getUsersWithWarehouseRoleAction() {
	try {
		const users = await prisma.user.findMany({
			where: {
				role: 'WAREHOUSE_WORKER',
			},
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
			},
			orderBy: {
				email: 'asc',
			},
		})
		return { success: true, users }
	} catch (error) {
		console.error('Ошибка получения пользователей:', error)
		return { error: 'Ошибка при получении пользователей' }
	}
}

