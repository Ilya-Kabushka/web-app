import { Role } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'

export const usersService = {
	getAll: async () => {
		return await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				avatarUrl: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: { createdAt: 'desc' },
		})
	},
	getById: async (id: number) => {
		return await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				avatarUrl: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	},
	create: async (data: {
		email: string
		password: string
		firstName?: string
		lastName?: string
		role: Role
		avatarUrl?: string
	}) => {
		return await prisma.user.create({
			data: {
				email: data.email,
				password: data.password, // должен быть хеширован перед вызовом
				firstName: data.firstName,
				lastName: data.lastName,
				role: data.role,
				avatarUrl: data.avatarUrl,
			},
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				avatarUrl: true,
			},
		})
	},
	update: async (
		id: number,
		data: {
			email?: string
			firstName?: string
			lastName?: string
			role?: Role
			avatarUrl?: string
			password?: string // хешированный пароль
		},
	) => {
		return await prisma.user.update({
			where: { id },
			data,
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				avatarUrl: true,
			},
		})
	},
	delete: async (id: number) => {
		return await prisma.user.delete({
			where: { id },
		})
	},
}
