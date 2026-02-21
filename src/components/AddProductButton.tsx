'use client'

import { Category } from '@/generated/prisma/client'
import { manageProductAction } from '@/server-actions/products.action'
import { UploadButton } from '@/utils/uploadthing'
import { Loader2, Pencil, Plus, X, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import { Textarea } from './ui/textarea'
// Using checkbox instead of Switch for now

interface Variant {
	name: string
	additionalPrice: number
	stock: number
	price: number
}

interface Stock {
	warehouseId: number
	quantity: number
}

interface Warehouse {
	id: number
	name: string
	location: string
}

interface AddProductButtonProps {
	categories: Category[]
	warehouses: Warehouse[]
	productToEdit?: {
		id: number
		name: string
		description?: string | null
		basePrice: number
		categoryId: number
		isAvailable: boolean
		hasVariants: boolean
		images?: { url: string; isPrimary: boolean }[]
		variants?: Variant[]
		stocks?: Array<{
			warehouseId: number
			quantity: number
			warehouse?: Warehouse
		}>
	} | null
}

export default function AddProductButton({
	categories,
	warehouses,
	productToEdit,
}: AddProductButtonProps) {
	const [isMounted, setIsMounted] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// Состояние для изображений
	const [imageUrls, setImageUrls] = useState<string[]>([])
	const [primaryImageIndex, setPrimaryImageIndex] = useState(0)

	// Состояние для вариантов
	const [variants, setVariants] = useState<Variant[]>([])
	const [hasVariants, setHasVariants] = useState(false)

	// Состояние для остатков
	const [stocks, setStocks] = useState<Stock[]>([])

	useEffect(() => {
		setIsMounted(true)
		if (productToEdit?.images) {
			const urls = productToEdit.images.map(img => img.url)
			setImageUrls(urls)
			const primaryIdx = productToEdit.images.findIndex(img => img.isPrimary)
			setPrimaryImageIndex(primaryIdx >= 0 ? primaryIdx : 0)
		} else {
			setImageUrls([])
			setPrimaryImageIndex(0)
		}

		if (productToEdit?.variants) {
			setVariants(productToEdit.variants)
			setHasVariants(true)
		} else {
			setVariants([])
			setHasVariants(productToEdit?.hasVariants || false)
		}

		if (productToEdit?.stocks) {
			setStocks(
				productToEdit.stocks.map(s => ({
					warehouseId: s.warehouseId,
					quantity: s.quantity,
				})),
			)
		} else {
			setStocks([])
		}
	}, [productToEdit])

	// Сброс формы при закрытии/открытии (для режима создания)
	useEffect(() => {
		if (isOpen && !productToEdit) {
			setImageUrls([])
			setPrimaryImageIndex(0)
			setVariants([])
			setHasVariants(false)
			setStocks([])
		}
		if (isOpen && productToEdit) {
			if (productToEdit.images) {
				const urls = productToEdit.images.map(img => img.url)
				setImageUrls(urls)
				const primaryIdx = productToEdit.images.findIndex(img => img.isPrimary)
				setPrimaryImageIndex(primaryIdx >= 0 ? primaryIdx : 0)
			}
			if (productToEdit.variants) {
				setVariants(productToEdit.variants)
				setHasVariants(true)
			}
			if (productToEdit.stocks) {
				setStocks(
					productToEdit.stocks.map(s => ({
						warehouseId: s.warehouseId,
						quantity: s.quantity,
					})),
				)
			}
		}
	}, [isOpen, productToEdit])

	if (!isMounted) return null

	const isEditMode = !!productToEdit

	// Обработчик отправки формы
	async function onSubmit(formData: FormData) {
		setIsLoading(true)
		try {
			// Переупорядочиваем изображения так, чтобы основное было первым
			const orderedImages = [...imageUrls]
			if (primaryImageIndex > 0 && orderedImages.length > 0) {
				const primary = orderedImages[primaryImageIndex]
				orderedImages.splice(primaryImageIndex, 1)
				orderedImages.unshift(primary)
			}

			formData.set('imageUrls', JSON.stringify(orderedImages))
			formData.set('variants', JSON.stringify(variants))
			formData.set('stocks', JSON.stringify(stocks))

			const res = await manageProductAction(formData)

			if (res.error) {
				toast.error(res.error)
			} else {
				toast.success(isEditMode ? 'Товар обновлен' : 'Товар создан')
				setIsOpen(false) // Закрываем шторку
			}
		} catch (error) {
			toast.error('Что-то пошло не так')
		} finally {
			setIsLoading(false)
		}
	}

	const handleImageUpload = (res: { url: string }[]) => {
		if (res && res.length > 0) {
			const newUrls = res.map(file => file.url)
			setImageUrls(prev => [...prev, ...newUrls])
			toast.success('Изображение загружено')
		}
	}

	const removeImage = (index: number) => {
		setImageUrls(prev => prev.filter((_, i) => i !== index))
		if (primaryImageIndex === index) {
			setPrimaryImageIndex(0)
		} else if (primaryImageIndex > index) {
			setPrimaryImageIndex(prev => prev - 1)
		}
	}

	const setAsPrimary = (index: number) => {
		setPrimaryImageIndex(index)
	}

	// Функции для работы с вариантами
	const addVariant = () => {
		setVariants([
			...variants,
			{
				name: '',
				additionalPrice: 0,
				stock: 0,
				price: 0,
			},
		])
	}

	const removeVariant = (index: number) => {
		setVariants(variants.filter((_, i) => i !== index))
	}

	const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
		const updated = [...variants]
		updated[index] = { ...updated[index], [field]: value }
		// Автоматически вычисляем итоговую цену варианта при изменении дополнительной цены
		if (field === 'additionalPrice') {
			const basePriceInput = document.querySelector<HTMLInputElement>('#basePrice')
			const basePrice = basePriceInput ? Number(basePriceInput.value) || 0 : 0
			updated[index].price = basePrice + Number(value)
		}
		setVariants(updated)
	}

	// Функции для работы с остатками
	const addStock = () => {
		// Находим склад, который еще не добавлен
		const usedWarehouseIds = stocks.map(s => s.warehouseId)
		const availableWarehouse = warehouses.find(w => !usedWarehouseIds.includes(w.id))
		
		if (availableWarehouse) {
			setStocks([
				...stocks,
				{
					warehouseId: availableWarehouse.id,
					quantity: 0,
				},
			])
		} else {
			toast.error('Все склады уже добавлены')
		}
	}

	const removeStock = (index: number) => {
		setStocks(stocks.filter((_, i) => i !== index))
	}

	const updateStock = (index: number, field: keyof Stock, value: number) => {
		const updated = [...stocks]
		updated[index] = { ...updated[index], [field]: value }
		setStocks(updated)
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
						Добавить товар
					</Button>
				)}
			</SheetTrigger>

			<SheetContent className='overflow-y-auto'>
				<SheetHeader>
					<SheetTitle>
						{isEditMode ? 'Редактировать товар' : 'Новый товар'}
					</SheetTitle>
					<SheetDescription>
						{isEditMode
							? 'Внесите изменения и нажмите сохранить.'
							: 'Заполните информацию для создания товара.'}
					</SheetDescription>
				</SheetHeader>

				<form action={onSubmit} className='grid w-full gap-6 py-4'>
					{/* СКРЫТЫЕ ПОЛЯ для передачи данных в Server Action */}
					{isEditMode && (
						<input type='hidden' name='id' value={productToEdit.id} />
					)}
					<input type='hidden' name='imageUrls' value={JSON.stringify(imageUrls)} />

					{/* --- Блок загрузки изображений --- */}
					<div className='space-y-2'>
						<Label>Изображения товара</Label>
						<div className='space-y-3'>
							{imageUrls.length > 0 && (
								<div className='grid grid-cols-2 gap-3'>
									{imageUrls.map((url, index) => (
										<div
											key={index}
											className='relative aspect-square w-full overflow-hidden rounded-md border'
										>
											<Image
												src={url}
												alt={`Product image ${index + 1}`}
												fill
												className='object-cover'
											/>
											<div className='absolute right-2 top-2 flex gap-1'>
												{index !== primaryImageIndex && (
													<Button
														type='button'
														onClick={() => setAsPrimary(index)}
														variant='secondary'
														size='icon'
														className='h-7 w-7 bg-white/90 hover:bg-white'
														title='Сделать основным'
													>
														⭐
													</Button>
												)}
												{index === primaryImageIndex && (
													<div className='flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground'>
														⭐
													</div>
												)}
												<Button
													type='button'
													onClick={() => removeImage(index)}
													variant='destructive'
													size='icon'
													className='h-7 w-7'
												>
													<X className='h-4 w-4' />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
							{imageUrls.length < 10 && (
								<div className='flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4'>
									<UploadButton
										endpoint='productImage'
										onClientUploadComplete={handleImageUpload}
										onUploadError={(error: Error) => {
											toast.error(`Ошибка: ${error.message}`)
										}}
										appearance={{
											button:
												'bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-9 px-4',
											allowedContent: 'text-xs text-muted-foreground',
										}}
									/>
									<p className='text-xs text-muted-foreground'>
										Можно загрузить до {10 - imageUrls.length} изображений
									</p>
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
							placeholder='Например: iPhone 15 Pro'
							required
							defaultValue={productToEdit?.name || ''}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='description'>Описание</Label>
						<Textarea
							id='description'
							name='description'
							placeholder='Подробное описание товара...'
							defaultValue={productToEdit?.description || ''}
							rows={4}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='basePrice'>Базовая цена</Label>
						<Input
							id='basePrice'
							name='basePrice'
							type='number'
							step='0.01'
							min='0'
							placeholder='0.00'
							required
							defaultValue={productToEdit?.basePrice?.toString() || ''}
							onChange={e => {
								// Обновляем итоговую цену всех вариантов при изменении базовой цены
								const basePrice = Number(e.target.value) || 0
								setVariants(prev =>
									prev.map(v => ({
										...v,
										price: basePrice + v.additionalPrice,
									})),
								)
							}}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='categoryId'>Категория</Label>
						<Select
							name='categoryId'
							defaultValue={productToEdit?.categoryId?.toString() || ''}
							required
						>
							<SelectTrigger>
								<SelectValue placeholder='Выберите категорию' />
							</SelectTrigger>
							<SelectContent>
								{categories.map(category => (
									<SelectItem key={category.id} value={category.id.toString()}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='flex items-center justify-between space-x-2 rounded-md border p-4'>
						<div className='space-y-0.5'>
							<Label htmlFor='hasVariants'>Товар с вариантами</Label>
							<p className='text-xs text-muted-foreground'>
								Включите, если у товара есть варианты (размер, цвет и т.д.)
							</p>
						</div>
						<input
							id='hasVariants'
							name='hasVariants'
							type='checkbox'
							checked={hasVariants}
							onChange={e => {
								setHasVariants(e.target.checked)
								if (!e.target.checked) {
									setVariants([])
								}
							}}
							className='h-4 w-4 rounded border-gray-300'
							value='true'
						/>
					</div>

					{/* --- Блок вариантов товара --- */}
					{hasVariants && (
						<div className='space-y-3 rounded-md border p-4'>
							<div className='flex items-center justify-between'>
								<Label>Варианты товара</Label>
								<Button
									type='button'
									onClick={addVariant}
									variant='outline'
									size='sm'
								>
									<Plus className='mr-2 h-4 w-4' />
									Добавить вариант
								</Button>
							</div>
							{variants.length === 0 ? (
								<p className='text-sm text-muted-foreground'>
									Добавьте варианты товара (например, размер, цвет)
								</p>
							) : (
								<div className='space-y-3'>
									{variants.map((variant, index) => (
										<div
											key={index}
											className='rounded-md border bg-muted/50 p-3 space-y-2'
										>
											<div className='flex items-center justify-between'>
												<span className='text-sm font-medium'>
													Вариант {index + 1}
												</span>
												<Button
													type='button'
													onClick={() => removeVariant(index)}
													variant='ghost'
													size='icon'
													className='h-7 w-7 text-destructive'
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
											<div className='grid grid-cols-2 gap-2'>
												<div className='space-y-1'>
													<Label className='text-xs'>Название</Label>
													<Input
														placeholder='Например: Красный, XL'
														value={variant.name}
														onChange={e =>
															updateVariant(index, 'name', e.target.value)
														}
														required
													/>
												</div>
												<div className='space-y-1'>
													<Label className='text-xs'>Доп. цена</Label>
													<Input
														type='number'
														step='0.01'
														placeholder='0.00'
														value={variant.additionalPrice}
														onChange={e =>
															updateVariant(
																index,
																'additionalPrice',
																Number(e.target.value) || 0,
															)
														}
													/>
												</div>
												<div className='space-y-1'>
													<Label className='text-xs'>Остаток</Label>
													<Input
														type='number'
														min='0'
														placeholder='0'
														value={variant.stock}
														onChange={e =>
															updateVariant(
																index,
																'stock',
																Number(e.target.value) || 0,
															)
														}
													/>
												</div>
												<div className='space-y-1'>
													<Label className='text-xs'>Итоговая цена</Label>
													<Input
														type='number'
														step='0.01'
														value={variant.price}
														onChange={e =>
															updateVariant(
																index,
																'price',
																Number(e.target.value) || 0,
															)
														}
														disabled
														className='bg-muted'
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* --- Блок остатков на складах --- */}
					<div className='space-y-3 rounded-md border p-4'>
						<div className='flex items-center justify-between'>
							<Label>Остатки на складах</Label>
							<Button
								type='button'
								onClick={addStock}
								variant='outline'
								size='sm'
								disabled={stocks.length >= warehouses.length}
							>
								<Plus className='mr-2 h-4 w-4' />
								Добавить склад
							</Button>
						</div>
						{stocks.length === 0 ? (
							<p className='text-sm text-muted-foreground'>
								Добавьте остатки товара на складах
							</p>
						) : (
							<div className='space-y-2'>
								{stocks.map((stock, index) => {
									const warehouse = warehouses.find(w => w.id === stock.warehouseId)
									return (
										<div
											key={index}
											className='flex items-center gap-2 rounded-md border bg-muted/50 p-2'
										>
											<div className='flex-1'>
												<Label className='text-xs'>
													{warehouse?.name || 'Неизвестный склад'}
												</Label>
												<p className='text-xs text-muted-foreground'>
													{warehouse?.location}
												</p>
											</div>
											<div className='w-24'>
												<Input
													type='number'
													min='0'
													placeholder='0'
													value={stock.quantity}
													onChange={e =>
														updateStock(
															index,
															'quantity',
															Number(e.target.value) || 0,
														)
													}
												/>
											</div>
											<Button
												type='button'
												onClick={() => removeStock(index)}
												variant='ghost'
												size='icon'
												className='h-8 w-8 text-destructive'
											>
												<X className='h-4 w-4' />
											</Button>
										</div>
									)
								})}
							</div>
						)}
					</div>

					<div className='flex items-center justify-between space-x-2 rounded-md border p-4'>
						<div className='space-y-0.5'>
							<Label htmlFor='isAvailable'>Доступен для продажи</Label>
							<p className='text-xs text-muted-foreground'>
								Товар будет виден покупателям
							</p>
						</div>
						<input
							id='isAvailable'
							name='isAvailable'
							type='checkbox'
							defaultChecked={productToEdit?.isAvailable ?? true}
							className='h-4 w-4 rounded border-gray-300'
							value='true'
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

