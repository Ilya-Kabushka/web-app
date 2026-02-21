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
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface User {
	id: number
	email: string
	firstName: string | null
	lastName: string | null
	addresses: Array<{
		id: number
		street: string
		city: string
		postCode: string
	}>
}

interface PaymentMethod {
	id: number
	type: string
}

interface AdminCreateOrderButtonProps {
	users: User[]
	paymentMethods: PaymentMethod[]
}

export function AdminCreateOrderButton({
	users,
	paymentMethods,
}: AdminCreateOrderButtonProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [selectedUserId, setSelectedUserId] = useState<string>('')
	const [selectedAddressId, setSelectedAddressId] = useState<string>('')
	const [selectedPaymentId, setSelectedPaymentId] = useState<string>('')
	const [promocode, setPromocode] = useState('')

	const selectedUser = users.find(u => u.id === Number(selectedUserId))
	const userAddresses = selectedUser?.addresses || []

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!selectedUserId || !selectedAddressId) {
			toast.error('Выберите пользователя и адрес доставки')
			return
		}

		setIsLoading(true)
		try {
			const result = await createOrderAction(
				Number(selectedUserId),
				Number(selectedAddressId),
				selectedPaymentId ? Number(selectedPaymentId) : undefined,
				promocode || undefined,
			)

			if (result?.error) {
				toast.error(result.error)
			} else if (result?.success && result?.orderId) {
				toast.success('Заказ успешно создан')
				setIsOpen(false)
				setSelectedUserId('')
				setSelectedAddressId('')
				setSelectedPaymentId('')
				setPromocode('')
			}
		} catch (error) {
			toast.error('Ошибка при создании заказа')
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant='default' size='sm' className='gap-2'>
					<Plus className='h-4 w-4' />
					Создать заказ
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Создать заказ</DialogTitle>
					<DialogDescription>
						Создайте новый заказ для покупателя из его корзины
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* Выбор пользователя */}
					<div className='space-y-2'>
						<Label htmlFor='user-select'>Покупатель</Label>
						<Select value={selectedUserId} onValueChange={setSelectedUserId}>
							<SelectTrigger id='user-select'>
								<SelectValue placeholder='Выберите покупателя' />
							</SelectTrigger>
							<SelectContent>
								{users.map(user => (
									<SelectItem key={user.id} value={String(user.id)}>
										{user.firstName && user.lastName
											? `${user.firstName} ${user.lastName}`
											: user.email}{' '}
										({user.email})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Выбор адреса доставки */}
					{userAddresses.length > 0 && (
						<div className='space-y-2'>
							<Label htmlFor='address-select'>Адрес доставки</Label>
							<Select
								value={selectedAddressId}
								onValueChange={setSelectedAddressId}
							>
								<SelectTrigger id='address-select'>
									<SelectValue placeholder='Выберите адрес' />
								</SelectTrigger>
								<SelectContent>
									{userAddresses.map(address => (
										<SelectItem key={address.id} value={String(address.id)}>
											{address.city}, {address.street}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{selectedUser && userAddresses.length === 0 && (
						<div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
							У этого пользователя нет адресов доставки
						</div>
					)}

					{/* Выбор способа оплаты */}
					{paymentMethods.length > 0 && (
						<div className='space-y-2'>
							<Label htmlFor='payment-select'>
								Способ оплаты (опционально)
							</Label>
							<Select
								value={selectedPaymentId}
								onValueChange={setSelectedPaymentId}
							>
								<SelectTrigger id='payment-select'>
									<SelectValue placeholder='Выберите способ оплаты' />
								</SelectTrigger>
								<SelectContent>
									{paymentMethods.map(method => (
										<SelectItem key={method.id} value={String(method.id)}>
											{method.type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{/* Промокод */}
					<div className='space-y-2'>
						<Label htmlFor='promo-input'>Промокод (опционально)</Label>
						<Input
							id='promo-input'
							placeholder='Введите промокод'
							value={promocode}
							onChange={e => setPromocode(e.target.value)}
							disabled={isLoading}
						/>
					</div>

					<Button
						type='submit'
						disabled={!selectedUserId || !selectedAddressId || isLoading}
						className='w-full'
					>
						{isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
						{isLoading ? 'Создание...' : 'Создать заказ'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}
