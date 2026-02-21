'use client'

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@/components/ui/select'
import { updateOrderStatusAction } from '@/server-actions/orders.action'
import { useState } from 'react'

const STATUS_LABELS: Record<string, string> = {
	PENDING: 'Ожидание',
	PROCESSING: 'В обработке',
	SHIPPED: 'Отправлено',
	DELIVERED: 'Доставлено',
	CANCELED: 'Отменено',
}

const STATUS_COLORS: Record<string, string> = {
	PENDING: 'bg-yellow-100 text-yellow-800',
	PROCESSING: 'bg-blue-100 text-blue-800',
	SHIPPED: 'bg-purple-100 text-purple-800',
	DELIVERED: 'bg-green-100 text-green-800',
	CANCELED: 'bg-red-100 text-red-800',
}

interface UpdateOrderStatusButtonProps {
	orderId: number
	currentStatus: string
	disabled?: boolean
}

export function UpdateOrderStatusButton({
	orderId,
	currentStatus,
	disabled = false,
}: UpdateOrderStatusButtonProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [status, setStatus] = useState<string>(currentStatus)

	const handleStatusChange = async (newStatus: string) => {
		setIsLoading(true)
		try {
			const result = await updateOrderStatusAction(orderId, newStatus)
			if (result.error) {
				alert(result.error)
				setStatus(currentStatus)
			} else {
				setStatus(newStatus)
			}
		} catch (error) {
			alert('Ошибка при обновлении статуса')
			setStatus(currentStatus)
		} finally {
			setIsLoading(false)
		}
	}

	// Доставленные и отмененные заказы нельзя менять
	const isEditable = status !== 'DELIVERED' && status !== 'CANCELED'

	return (
		<div className='flex items-center gap-2'>
			<Select
				value={status}
				onValueChange={handleStatusChange}
				disabled={!isEditable || isLoading || disabled}
			>
				<SelectTrigger className='w-auto border-none bg-transparent p-0 h-auto'>
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
					>
						{STATUS_LABELS[status]}
					</span>
				</SelectTrigger>
				<SelectContent>
					{Object.entries(STATUS_LABELS).map(([key, label]) => (
						<SelectItem
							key={key}
							value={key}
							disabled={key === 'CANCELED' && status !== 'PENDING'}
						>
							{label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}

// Компонент для отображения статуса без возможности изменения
export function OrderStatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
		>
			{STATUS_LABELS[status]}
		</span>
	)
}
