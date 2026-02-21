'use client'

import { Category } from '@/generated/prisma/client' // Твой путь к типам
import { manageCategoryAction } from '@/server-actions/categories.action'
import { UploadButton } from '@/utils/uploadthing' // Твой конфиг UploadThing
import { Loader2, Pencil, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner' // Или useToast из shadcn/ui, если используешь его
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet'
import { Textarea } from './ui/textarea' // Добавим для описания

interface AddCategoryButtonProps {
	categ: Category[]
	categoryToEdit?:
		| (Category & { categoryImage?: { url: string } | null })
		| null
}

export default function AddCategoryButton({
	categ,
	categoryToEdit,
}: AddCategoryButtonProps) {
	const [isMounted, setIsMounted] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// Состояние для картинки. Если редактируем — берем из пропсов, иначе пусто
	const [imageUrl, setImageUrl] = useState<string>('')

	useEffect(() => {
		setIsMounted(true)
		if (categoryToEdit?.categoryImage?.url) {
			setImageUrl(categoryToEdit.categoryImage.url)
		} else {
			setImageUrl('')
		}
	}, [categoryToEdit])

	// Сброс формы при закрытии/открытии (для режима создания)
	useEffect(() => {
		if (isOpen && !categoryToEdit) {
			setImageUrl('')
		}
		if (isOpen && categoryToEdit?.categoryImage?.url) {
			setImageUrl(categoryToEdit.categoryImage.url)
		}
	}, [isOpen, categoryToEdit])

	if (!isMounted) return null

	const isEditMode = !!categoryToEdit

	// Фильтруем родителей (нельзя выбрать себя или своих детей, но пока просто себя)
	const availableParents = isEditMode
		? categ.filter(c => c.id !== categoryToEdit.id)
		: categ

	// Обработчик отправки формы
	async function onSubmit(formData: FormData) {
		setIsLoading(true)
		try {
			const res = await manageCategoryAction(formData)

			if (res.error) {
				toast.error(res.error)
			} else {
				toast.success(isEditMode ? 'Категория обновлена' : 'Категория создана')
				setIsOpen(false) // Закрываем шторку
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
						Добавить категорию
					</Button>
				)}
			</SheetTrigger>

			<SheetContent className='overflow-y-auto'>
				<SheetHeader>
					<SheetTitle>
						{isEditMode ? 'Редактировать категорию' : 'Новая категория'}
					</SheetTitle>
					<SheetDescription>
						{isEditMode
							? 'Внесите изменения и нажмите сохранить.'
							: 'Заполните информацию для создания категории.'}
					</SheetDescription>
				</SheetHeader>

				<form action={onSubmit} className='grid w-full gap-6 py-4'>
					{/* СКРЫТЫЕ ПОЛЯ для передачи данных в Server Action */}
					{isEditMode && (
						<input type='hidden' name='id' value={categoryToEdit.id} />
					)}
					<input type='hidden' name='imageUrl' value={imageUrl} />

					{/* --- Блок загрузки изображения --- */}
					<div className='space-y-2'>
						<Label>Изображение</Label>
						<div className='flex flex-col items-center justify-center gap-4 rounded-md border p-4 border-dashed'>
							{imageUrl ? (
								<div className='relative aspect-video w-full h-40 overflow-hidden rounded-md'>
									<Image
										src={imageUrl}
										alt='Category Image'
										fill
										className='object-cover'
									/>
									<Button
										type='button'
										onClick={() => setImageUrl('')}
										variant='destructive'
										size='icon'
										className='absolute right-2 top-2 h-6 w-6'
									>
										<X className='h-4 w-4' />
									</Button>
								</div>
							) : (
								<div className='flex flex-col items-center'>
									<UploadButton
										endpoint='categoryImage'
										onClientUploadComplete={res => {
											if (res?.[0]) {
												setImageUrl(res[0].url)
												toast.success('Изображение загружено')
											}
										}}
										onUploadError={(error: Error) => {
											toast.error(`Ошибка: ${error.message}`)
										}}
										appearance={{
											button:
												'bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-9 px-4',
											allowedContent: 'text-xs text-muted-foreground',
										}}
									/>
								</div>
							)}
						</div>
					</div>

					{/* --- Основные поля --- */}
					<div className='space-y-2'>
						<Label htmlFor='name'>Название</Label>
						<Input
							id='name'
							name='name'
							placeholder='Например: Смартфоны'
							required
							defaultValue={categoryToEdit?.name || ''}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='description'>Описание</Label>
						<Textarea
							id='description'
							name='description'
							placeholder='Краткое описание категории...'
							defaultValue={categoryToEdit?.description || ''}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='parentCategoryId'>Родительская категория</Label>
						<Select
							name='parentCategoryId'
							defaultValue={categoryToEdit?.parentCategoryId?.toString() || '0'}
						>
							<SelectTrigger>
								<SelectValue placeholder='Выберите родителя' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='0'>— Без родителя (Корневая) —</SelectItem>
								{availableParents.map(item => (
									<SelectItem key={item.id} value={item.id.toString()}>
										{item.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
