'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteUserAction } from '@/server-actions/users.action'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeleteUserButtonProps {
	userId: number
	userName: string
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
	const [isLoading, setIsLoading] = useState(false)

	const onDelete = async () => {
		setIsLoading(true)
		const result = await deleteUserAction(userId)
		setIsLoading(false)

		if (result.success) {
			toast.success(`Пользователь "${userName}" удален`)
		} else {
			toast.error(result.error)
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant='ghost'
					size='icon'
					className='text-destructive hover:bg-destructive/10'
				>
					<Trash2 className='h-4 w-4' />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className='flex items-center gap-2'>
						<AlertTriangle className='h-5 w-5 text-destructive' />
						Вы уверены?
					</AlertDialogTitle>
					<AlertDialogDescription className='space-y-3'>
						<p>
							Вы собираетесь удалить пользователя <strong>"{userName}"</strong>.
						</p>
						<div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive font-medium text-sm'>
							Это действие нельзя будет отменить. Все данные пользователя будут
							удалены.
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Отмена</AlertDialogCancel>
					<AlertDialogAction
						onClick={onDelete}
						disabled={isLoading}
						className='bg-destructive hover:bg-destructive/90'
					>
						{isLoading ? 'Удаление...' : 'Удалить'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
