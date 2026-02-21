'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { createOrderAction } from '@/server-actions/orders.action'
import { Loader2, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CreateOrderButtonProps {
	userId: number
	cartTotal: number
	addresses: Array<{
		id: number
		street: string
		city: string
		postCode: string
	}>
	paymentMethods?: Array<{
		id: number
		type: string
	}>
}

export function CreateOrderButton({
	userId,
	cartTotal,
	addresses,
	paymentMethods = [],
}: CreateOrderButtonProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [selectedAddressId, setSelectedAddressId] = useState<string>('')
	const [selectedPaymentId, setSelectedPaymentId] = useState<string>('')
	const [promocodeCode, setPromocodeCode] = useState('')

	const handleCreateOrder = async () => {
		if (!selectedAddressId) {
			toast.error('Выберите адрес доставки')
			return
		}

		setIsLoading(true)
		try {
			const result = await createOrderAction(
				userId,
				parseInt(selectedAddressId, 10),
				selectedPaymentId ? parseInt(selectedPaymentId, 10) : undefined,
				promocodeCode || undefined,
			)

			if (result.success) {
				toast.success('Заказ успешно создан!')
				setIsOpen(false)
				setSelectedAddressId('')
				setSelectedPaymentId('')
				setPromocodeCode('')
				// Перенаправление на страницу заказов можно добавить через router.push
				window.location.href = `/orders/${result.orderId}`
			} else {
				toast.error(result.error || 'Ошибка при создании заказа')
			}
		} catch (error) {
			toast.error('Ошибка при создании заказа')
		} finally {
			setIsLoading(false)
		}
	}

	if (addresses.length === 0) {
		return (
			<Button disabled>
				<ShoppingCart className='h-4 w-4 mr-2' />
				Добавьте адрес доставки
			</Button>
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button size='lg'>
					<ShoppingCart className='h-4 w-4 mr-2' />
					Оформить заказ ({cartTotal.toFixed(2)} BYN)
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Оформление заказа</DialogTitle>
					<DialogDescription>
						Проверьте данные и завершите оформление
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Адрес доставки */}
					<div className='space-y-2'>
						<Label htmlFor='address'>Адрес доставки *</Label>
						<Select
							value={selectedAddressId}
							onValueChange={setSelectedAddressId}
						>
							<SelectTrigger id='address'>
								<SelectValue placeholder='Выберите адрес доставки' />
							</SelectTrigger>
							<SelectContent>
								{addresses.map(address => (
									<SelectItem key={address.id} value={address.id.toString()}>
										{address.city}, {address.street}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Способ оплаты */}
					{paymentMethods.length > 0 && (
						<div className='space-y-2'>
							<Label htmlFor='payment'>Способ оплаты</Label>
							<Select
								value={selectedPaymentId}
								onValueChange={setSelectedPaymentId}
							>
								<SelectTrigger id='payment'>
									<SelectValue placeholder='Выберите способ оплаты' />
								</SelectTrigger>
								<SelectContent>
									{paymentMethods.map(method => (
										<SelectItem key={method.id} value={method.id.toString()}>
											{method.type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{/* Промокод */}
					<div className='space-y-2'>
						<Label htmlFor='promo'>Промокод (необязательно)</Label>
						<Input
							id='promo'
							placeholder='Введите код промокода'
							value={promocodeCode}
							onChange={e => setPromocodeCode(e.target.value.toUpperCase())}
							disabled={isLoading}
						/>
					</div>

					{/* Итоговая сумма */}
					<div className='border-t pt-4'>
						<div className='flex justify-between items-center'>
							<span className='text-lg font-semibold'>Итого:</span>
							<span className='text-2xl font-bold'>
								{cartTotal.toFixed(2)} BYN
							</span>
						</div>
					</div>

					{/* Кнопки */}
					<div className='flex gap-2 justify-end'>
						<Button
							variant='outline'
							onClick={() => setIsOpen(false)}
							disabled={isLoading}
						>
							Отмена
						</Button>
						<Button onClick={handleCreateOrder} disabled={isLoading}>
							{isLoading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
							Создать заказ
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
