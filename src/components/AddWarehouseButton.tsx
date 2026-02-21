'use client'

import { manageWarehouseAction } from '@/server-actions/warehouses.action'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet'

interface Warehouse {
	id: number
	name: string
	location: string
}

interface AddWarehouseButtonProps {
	warehouseToEdit?: Warehouse | null
}

export default function AddWarehouseButton({
	warehouseToEdit,
}: AddWarehouseButtonProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const isEditMode = !!warehouseToEdit

	async function onSubmit(formData: FormData) {
		setIsLoading(true)
		try {
			const res = await manageWarehouseAction(formData)

			if (res.error) {
				toast.error(res.error)
			} else {
				toast.success(
					isEditMode ? 'Склад обновлен' : 'Склад создан',
				)
				setIsOpen(false)
			}
		} catch (error) {
			toast.error('Что-то пошло не так')
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
					<Button variant='outline' size='sm'>
						<Plus className='mr-2 h-4 w-4' />
						Добавить склад
					</Button>
				)}
			</SheetTrigger>

			<SheetContent className='overflow-y-auto'>
				<SheetHeader>
					<SheetTitle>
						{isEditMode ? 'Редактировать склад' : 'Новый склад'}
					</SheetTitle>
					<SheetDescription>
						{isEditMode
							? 'Внесите изменения и нажмите сохранить.'
							: 'Заполните информацию для создания склада.'}
					</SheetDescription>
				</SheetHeader>

				<form action={onSubmit} className='grid w-full gap-6 py-4'>
					{isEditMode && (
						<input type='hidden' name='id' value={warehouseToEdit.id} />
					)}

					<div className='space-y-2'>
						<Label htmlFor='name'>Название</Label>
						<Input
							id='name'
							name='name'
							placeholder='Например: Склад №1'
							required
							defaultValue={warehouseToEdit?.name || ''}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='location'>Адрес</Label>
						<Input
							id='location'
							name='location'
							placeholder='Например: г. Москва, ул. Ленина, д. 1'
							required
							defaultValue={warehouseToEdit?.location || ''}
						/>
					</div>

					<Button type='submit' disabled={isLoading} className='mt-2'>
						{isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
						{isEditMode ? 'Сохранить' : 'Создать'}
					</Button>
				</form>
			</SheetContent>
		</Sheet>
	)
}

