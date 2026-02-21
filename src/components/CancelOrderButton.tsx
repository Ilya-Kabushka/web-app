'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cancelOrderAction } from '@/server-actions/orders.action'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface CancelOrderButtonProps {
	orderId: number
	disabled?: boolean
	canCancel: boolean
}

export function CancelOrderButton({
	orderId,
	disabled = false,
	canCancel = true,
}: CancelOrderButtonProps) {
	const [isLoading, setIsLoading] = useState(false)

	const handleCancel = async () => {
		setIsLoading(true)
		try {
			const result = await cancelOrderAction(orderId)
			if (result.error) {
				alert(result.error)
			}
		} catch (error) {
			alert('Ошибка при отмене заказа')
		} finally {
			setIsLoading(false)
		}
	}

	if (!canCancel) {
		return null
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant='destructive'
					size='sm'
					disabled={disabled || isLoading}
				>
					<Trash2 className='h-4 w-4 mr-2' />
					Отменить
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Отменить заказ?</AlertDialogTitle>
					<AlertDialogDescription>
						Вы уверены, что хотите отменить этот заказ? Это действие нельзя
						будет отменить.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className='flex justify-end gap-2'>
					<AlertDialogCancel>Нет, оставить</AlertDialogCancel>
					<AlertDialogAction onClick={handleCancel}>
						Да, отменить заказ
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	)
}
