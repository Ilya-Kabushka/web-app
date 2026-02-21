'use client'

import { deleteWarehouseAction } from '@/server-actions/warehouses.action'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
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
	AlertDialogTrigger,
} from './ui/alert-dialog'
import { Button } from './ui/button'

interface DeleteWarehouseButtonProps {
	warehouseId: number
	warehouseName: string
	hasStocks?: boolean
	hasWorkers?: boolean
}

export function DeleteWarehouseButton({
	warehouseId,
	warehouseName,
	hasStocks = false,
	hasWorkers = false,
}: DeleteWarehouseButtonProps) {
	const [isLoading, setIsLoading] = useState(false)

	async function handleDelete() {
		setIsLoading(true)
		try {
			const res = await deleteWarehouseAction(warehouseId)

			if (res.error) {
				toast.error(res.error)
			} else {
				toast.success('Склад удален')
			}
		} catch (error) {
			toast.error('Что-то пошло не так')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant='ghost' size='icon' disabled={isLoading}>
					<Trash2 className='h-4 w-4 text-destructive' />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Удалить склад?</AlertDialogTitle>
					<AlertDialogDescription>
						Вы уверены, что хотите удалить склад "{warehouseName}"?
						{hasStocks && (
							<span className='block mt-2 text-destructive font-semibold'>
								Внимание: на этом складе есть товары!
							</span>
						)}
						{hasWorkers && (
							<span className='block mt-2 text-destructive font-semibold'>
								Внимание: на этом складе работают сотрудники!
							</span>
						)}
						Это действие нельзя отменить.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Отмена</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isLoading}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
					>
						Удалить
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

