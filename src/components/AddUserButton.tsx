'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import {
	createUserAction,
	updateUserAction,
} from '@/server-actions/users.action'
import { UploadButton } from '@/utils/uploadthing'
import { Loader2, Pencil, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface User {
	id: number
	email: string
	firstName: string | null
	lastName: string | null
	role: string
	avatarUrl: string | null
	createdAt: Date
	updatedAt: Date
}

interface AddUserButtonProps {
	userToEdit?: User | null
}

const ROLES = [
	{ value: 'USER', label: 'Пользователь' },
	{ value: 'ADMIN', label: 'Администратор' },
	{ value: 'WAREHOUSE_WORKER', label: 'Работник склада' },
	{ value: 'ANALYTICS', label: 'Аналитик' },
]

export default function AddUserButton({ userToEdit }: AddUserButtonProps) {
	const [isMounted, setIsMounted] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [avatarUrl, setAvatarUrl] = useState<string>('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	const isEditMode = !!userToEdit

	useEffect(() => {
		setIsMounted(true)
		if (userToEdit?.avatarUrl) {
			setAvatarUrl(userToEdit.avatarUrl)
		} else {
			setAvatarUrl('')
		}
		if (!isEditMode) {
			setPassword('')
		}
	}, [userToEdit, isEditMode])

	if (!isMounted) return null

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)

		const formData = new FormData(e.currentTarget)
		formData.set('avatarUrl', avatarUrl)

		try {
			const res = isEditMode
				? await updateUserAction(formData)
				: await createUserAction(formData)

			if (res.error) {
				toast.error(res.error)
			} else {
				toast.success(
					isEditMode ? 'Пользователь обновлен' : 'Пользователь создан',
				)
				setIsOpen(false)
				setPassword('')
				setAvatarUrl('')
			}
		} catch (error) {
			toast.error('Ошибка при сохранении')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				{isEditMode ? (
					<Button variant='ghost' size='icon'>
						<Pencil className='h-4 w-4' />
					</Button>
				) : (
					<Button>
						<Plus className='mr-2 h-4 w-4' />
						Новый пользователь
					</Button>
				)}
			</SheetTrigger>
			<SheetContent className='w-96 overflow-y-auto'>
				<SheetHeader>
					<SheetTitle>
						{isEditMode ? 'Редактировать пользователя' : 'Новый пользователь'}
					</SheetTitle>
					<SheetDescription>
						{isEditMode
							? 'Измените данные пользователя'
							: 'Заполните информацию о новом пользователе'}
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={onSubmit} className='space-y-6 py-6'>
					{isEditMode && (
						<input type='hidden' name='id' value={userToEdit?.id} />
					)}

					{/* Аватар */}
					<div className='space-y-2'>
						<Label>Фотография</Label>
						<div className='flex flex-col gap-2'>
							{avatarUrl && (
								<div className='relative w-full h-32 rounded-lg overflow-hidden bg-muted'>
									<Image
										src={avatarUrl}
										alt='Avatar'
										fill
										className='object-cover'
									/>
									<button
										type='button'
										onClick={() => setAvatarUrl('')}
										className='absolute top-1 right-1 p-1 bg-red-500/80 rounded-full hover:bg-red-600'
									>
										<X className='h-3 w-3 text-white' />
									</button>
								</div>
							)}
							<UploadButton
								endpoint='imageUploader'
								onClientUploadComplete={res => {
									if (res?.[0]?.url) {
										setAvatarUrl(res[0].url)
										toast.success('Фотография загружена')
									}
								}}
								onUploadError={error => {
									toast.error(`Ошибка: ${error.message}`)
								}}
							/>
						</div>
					</div>

					{/* Email */}
					<div className='space-y-2'>
						<Label htmlFor='email'>Email *</Label>
						<Input
							id='email'
							name='email'
							type='email'
							defaultValue={userToEdit?.email || ''}
							placeholder='user@example.com'
							required
						/>
					</div>

					{/* Пароль */}
					<div className='space-y-2'>
						<Label htmlFor='password'>
							Пароль {isEditMode ? '(оставить пусто, чтобы не менять)' : '*'}
						</Label>
						<div className='flex gap-2'>
							<Input
								id='password'
								name='password'
								type={showPassword ? 'text' : 'password'}
								placeholder='Введите пароль'
								value={password}
								onChange={e => setPassword(e.target.value)}
								required={!isEditMode}
							/>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? '🙈' : '👁'}
							</Button>
						</div>
					</div>

					{/* Имя */}
					<div className='space-y-2'>
						<Label htmlFor='firstName'>Имя</Label>
						<Input
							id='firstName'
							name='firstName'
							defaultValue={userToEdit?.firstName || ''}
							placeholder='Иван'
						/>
					</div>

					{/* Фамилия */}
					<div className='space-y-2'>
						<Label htmlFor='lastName'>Фамилия</Label>
						<Input
							id='lastName'
							name='lastName'
							defaultValue={userToEdit?.lastName || ''}
							placeholder='Иванов'
						/>
					</div>

					{/* Роль */}
					<div className='space-y-2'>
						<Label htmlFor='role'>Роль *</Label>
						<Select
							defaultValue={userToEdit?.role || 'USER'}
							name='role'
							required
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ROLES.map(role => (
									<SelectItem key={role.value} value={role.value}>
										{role.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Кнопки */}
					<div className='flex gap-2 pt-4'>
						<Button type='submit' disabled={isLoading} className='flex-1'>
							{isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							{isEditMode ? 'Обновить' : 'Создать'}
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => setIsOpen(false)}
						>
							Отмена
						</Button>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	)
}
