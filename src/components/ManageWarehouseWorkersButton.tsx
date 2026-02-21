'use client'

import {
	addWorkerToWarehouseAction,
	getUsersWithWarehouseRoleAction,
	removeWorkerFromWarehouseAction,
} from '@/server-actions/warehouses.action'
import { Loader2, Plus, Trash2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './ui/alert-dialog'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select'

interface User {
	id: number
	email: string
	firstName: string | null
	lastName: string | null
	role: string
}

interface WarehouseWorker {
	id: number
	userId: number
	warehouseId: number
	user: User
}

interface ManageWarehouseWorkersButtonProps {
	warehouseId: number
	warehouseName: string
	workers: WarehouseWorker[]
}

export function ManageWarehouseWorkersButton({
	warehouseId,
	warehouseName,
	workers: initialWorkers,
}: ManageWarehouseWorkersButtonProps) {
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [workers, setWorkers] = useState(initialWorkers)
	const [availableUsers, setAvailableUsers] = useState<User[]>([])
	const [selectedUserId, setSelectedUserId] = useState<string>('')
	const [userToRemove, setUserToRemove] = useState<number | null>(null)

	useEffect(() => {
		if (isOpen) {
			loadAvailableUsers()
		}
	}, [isOpen])

	async function loadAvailableUsers() {
		try {
			const res = await getUsersWithWarehouseRoleAction()
			if (res.success && res.users) {
				// Фильтруем пользователей, которые еще не закреплены за этим складом
				const assignedUserIds = workers.map(w => w.userId)
				const available = res.users.filter(
					u => !assignedUserIds.includes(u.id),
				)
				setAvailableUsers(available)
			}
		} catch (error) {
			console.error('Ошибка загрузки пользователей:', error)
		}
	}

	async function handleAddWorker() {
		if (!selectedUserId) {
			toast.error('Выберите сотрудника')
			return
		}

		setIsLoading(true)
		try {
			const res = await addWorkerToWarehouseAction(
				warehouseId,
				Number(selectedUserId),
			)

			if (res.error) {
				toast.error(res.error)
			} else {
				toast.success('Сотрудник добавлен')
				setSelectedUserId('')
				// Перезагружаем список доступных пользователей
				await loadAvailableUsers()
				// Обновляем страницу для получения актуальных данных
				router.refresh()
			}
		} catch (error) {
			toast.error('Что-то пошло не так')
		} finally {
			setIsLoading(false)
		}
	}

	async function handleRemoveWorker(userId: number) {
		setIsLoading(true)
		try {
			const res = await removeWorkerFromWarehouseAction(warehouseId, userId)

			if (res.error) {
				toast.error(res.error)
			} else {
				toast.success('Сотрудник удален')
				setUserToRemove(null)
				// Обновляем список работников
				setWorkers(workers.filter(w => w.userId !== userId))
				await loadAvailableUsers()
			}
		} catch (error) {
			toast.error('Что-то пошло не так')
		} finally {
			setIsLoading(false)
		}
	}

	const getUserDisplayName = (user: User) => {
		if (user.firstName || user.lastName) {
			return `${user.firstName || ''} ${user.lastName || ''}`.trim()
		}
		return user.email
	}

	return (
		<>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button variant='outline' size='sm'>
						<Users className='mr-2 h-4 w-4' />
						Сотрудники ({workers.length})
					</Button>
				</DialogTrigger>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>Управление сотрудниками склада</DialogTitle>
						<DialogDescription>
							Склад: {warehouseName}
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						{/* Добавление нового сотрудника */}
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								Добавить сотрудника
							</label>
							<div className='flex gap-2'>
								<Select
									value={selectedUserId}
									onValueChange={setSelectedUserId}
									disabled={isLoading || availableUsers.length === 0}
								>
									<SelectTrigger className='flex-1'>
										<SelectValue
											placeholder={
												availableUsers.length === 0
													? 'Нет доступных сотрудников'
													: 'Выберите сотрудника'
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{availableUsers.map(user => (
											<SelectItem
												key={user.id}
												value={user.id.toString()}
											>
												{getUserDisplayName(user)} ({user.email})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button
									onClick={handleAddWorker}
									disabled={isLoading || !selectedUserId}
									size='sm'
								>
									{isLoading ? (
										<Loader2 className='h-4 w-4 animate-spin' />
									) : (
										<Plus className='h-4 w-4' />
									)}
								</Button>
							</div>
						</div>

						{/* Список текущих сотрудников */}
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								Текущие сотрудники ({workers.length})
							</label>
							{workers.length === 0 ? (
								<p className='text-sm text-muted-foreground'>
									На этом складе пока нет сотрудников
								</p>
							) : (
								<div className='space-y-2'>
									{workers.map(worker => (
										<div
											key={worker.id}
											className='flex items-center justify-between rounded-md border p-3'
										>
											<div className='flex-1'>
												<div className='font-medium'>
													{getUserDisplayName(worker.user)}
												</div>
												<div className='text-sm text-muted-foreground'>
													{worker.user.email}
												</div>
											</div>
											<Button
												variant='ghost'
												size='icon'
												onClick={() => setUserToRemove(worker.userId)}
												disabled={isLoading}
											>
												<Trash2 className='h-4 w-4 text-destructive' />
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Диалог подтверждения удаления */}
			<AlertDialog
				open={userToRemove !== null}
				onOpenChange={open => !open && setUserToRemove(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
						<AlertDialogDescription>
							Вы уверены, что хотите удалить этого сотрудника со склада?
							Это действие нельзя отменить.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setUserToRemove(null)}>
							Отмена
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (userToRemove !== null) {
									handleRemoveWorker(userToRemove)
								}
							}}
							disabled={isLoading}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							Удалить
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}

