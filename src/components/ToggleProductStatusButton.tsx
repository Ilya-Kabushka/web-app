'use client'

import { Button } from '@/components/ui/button'
import { toggleProductAvailabilityAction } from '@/server-actions/products.action'
import { Eye, EyeOff } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface ToggleProps {
	productId: number
	isAvailable: boolean
}

export function ToggleProductStatusButton({
	productId,
	isAvailable,
}: ToggleProps) {
	const [isPending, startTransition] = useTransition()
	// Локальное состояние для мгновенного визуального отклика
	const [optimisticStatus, setOptimisticStatus] = useState(isAvailable)

	const handleToggle = () => {
		const newStatus = !optimisticStatus
		setOptimisticStatus(newStatus) // Меняем сразу на клиенте

		startTransition(async () => {
			const result = await toggleProductAvailabilityAction(
				productId,
				optimisticStatus,
			)
			if (result.error) {
				setOptimisticStatus(!newStatus) // Откатываем, если ошибка
				toast.error(result.error)
			} else {
				toast.success(newStatus ? 'Товар теперь виден' : 'Товар скрыт')
			}
		})
	}

	return (
		<Button
			variant='ghost'
			size='icon'
			onClick={handleToggle}
			disabled={isPending}
			className={optimisticStatus ? 'text-green-600' : 'text-muted-foreground'}
			title={optimisticStatus ? 'Скрыть товар' : 'Показать товар'}
		>
			{optimisticStatus ? (
				<Eye className='h-4 w-4' />
			) : (
				<EyeOff className='h-4 w-4' />
			)}
		</Button>
	)
}
