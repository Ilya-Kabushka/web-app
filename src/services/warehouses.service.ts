import { prisma } from '@/lib/prisma'

export const warehouseService = {
	getAll: async () => {
		try {
			return await prisma.warehouse.findMany({
				orderBy: { name: 'asc' },
				include: {
					workers: {
						include: {
							user: true,
						},
					},
					stocks: true,
				},
			})
		} catch (error) {
			console.error('Error fetching warehouses:', error)
			throw error
		}
	},
	getById: async (id: number) => {
		try {
			return await prisma.warehouse.findUnique({
				where: { id },
				include: {
					stocks: {
						include: {
							product: true,
						},
					},
					workers: {
						include: {
							user: true,
						},
					},
				},
			})
		} catch (error) {
			console.error('Error fetching warehouse:', error)
			throw error
		}
	},
	create: async (data: { name: string; location: string }) => {
		try {
			return await prisma.warehouse.create({
				data: {
					name: data.name,
					location: data.location,
				},
			})
		} catch (error) {
			console.error('Error creating warehouse:', error)
			throw error
		}
	},
	update: async (id: number, data: { name?: string; location?: string }) => {
		try {
			return await prisma.warehouse.update({
				where: { id },
				data,
			})
		} catch (error) {
			console.error('Error updating warehouse:', error)
			throw error
		}
	},
	delete: async (id: number) => {
		try {
			return await prisma.warehouse.delete({
				where: { id },
			})
		} catch (error) {
			console.error('Error deleting warehouse:', error)
			throw error
		}
	},
	addWorker: async (warehouseId: number, userId: number) => {
		try {
			return await prisma.warehouseWorker.create({
				data: {
					warehouseId,
					userId,
				},
				include: {
					user: true,
					warehouse: true,
				},
			})
		} catch (error) {
			console.error('Error adding worker to warehouse:', error)
			throw error
		}
	},
	removeWorker: async (warehouseId: number, userId: number) => {
		try {
			return await prisma.warehouseWorker.delete({
				where: {
					userId_warehouseId: {
						userId,
						warehouseId,
					},
				},
			})
		} catch (error) {
			console.error('Error removing worker from warehouse:', error)
			throw error
		}
	},
	getWarehouseWorkers: async (warehouseId: number) => {
		try {
			return await prisma.warehouseWorker.findMany({
				where: { warehouseId },
				include: {
					user: true,
				},
			})
		} catch (error) {
			console.error('Error fetching warehouse workers:', error)
			throw error
		}
	},
}

