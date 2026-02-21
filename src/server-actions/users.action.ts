'use server'

import { prisma } from '@/lib/prisma'
import { usersService } from '@/services/users.service'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function createUserAction(formData: FormData) {
	const email = formData.get('email') as string
	const password = formData.get('password') as string
	const firstName = formData.get('firstName') as string
	const lastName = formData.get('lastName') as string
	const role = formData.get('role') as string
	const avatarUrl = formData.get('avatarUrl') as string

	if (!email || !password) {
		return { error: 'Email и пароль обязательны' }
	}

	try {
		// Проверим, что пользователь с таким email не существует
		const existingUser = await prisma.user.findUnique({
			where: { email },
		})

		if (existingUser) {
			return { error: 'Пользователь с таким email уже существует' }
		}

		// Хешируем пароль
		const hashedPassword = await bcrypt.hash(password, 10)

		await usersService.create({
			email,
			password: hashedPassword,
			firstName: firstName || undefined,
			lastName: lastName || undefined,
			role: role as any,
			avatarUrl: avatarUrl || undefined,
		})

		revalidatePath('/admin/dashboard/users')
		return { success: true }
	} catch (error) {
		console.error('Ошибка создания пользователя:', error)
		return { error: 'Не удалось создать пользователя' }
	}
}

export async function updateUserAction(formData: FormData) {
	const id = formData.get('id') as string
	const email = formData.get('email') as string
	const firstName = formData.get('firstName') as string
	const lastName = formData.get('lastName') as string
	const role = formData.get('role') as string
	const avatarUrl = formData.get('avatarUrl') as string
	const password = formData.get('password') as string

	if (!id || !email) {
		return { error: 'ID и email обязательны' }
	}

	try {
		const updateData: Record<string, any> = {
			email,
			firstName: firstName || null,
			lastName: lastName || null,
			role,
			avatarUrl: avatarUrl || null,
		}

		// Если пароль передан, хешируем его
		if (password) {
			updateData.password = await bcrypt.hash(password, 10)
		}

		await usersService.update(Number(id), updateData)

		revalidatePath('/admin/dashboard/users')
		return { success: true }
	} catch (error) {
		console.error('Ошибка обновления пользователя:', error)
		return { error: 'Не удалось обновить пользователя' }
	}
}

export async function deleteUserAction(id: number) {
	try {
		await usersService.delete(id)
		revalidatePath('/admin/dashboard/users')
		return { success: true }
	} catch (error) {
		console.error('Ошибка удаления пользователя:', error)
		return { error: 'Не удалось удалить пользователя' }
	}
}
