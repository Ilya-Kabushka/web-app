import AddProductButton from '@/components/AddProductButton'
import { DeleteProductButton } from '@/components/DeleteProductButton'
import { ToggleProductStatusButton } from '@/components/ToggleProductStatusButton'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { categoryService } from '@/services/categories.service'
import { productService } from '@/services/prosuct.service'
import { warehouseService } from '@/services/warehouses.service'
import { Image as ImageIcon, Package, Tag } from 'lucide-react'
import Image from 'next/image'

export default async function ProductsPage() {
	const [products, categories, warehouses] = await Promise.all([
		productService.getAll(),
		categoryService.getAll(),
		warehouseService.getAll(),
	])

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>Товары</h2>
					<p className='text-muted-foreground'>
						Управление товарами, изображениями, вариантами и остатками.
					</p>
				</div>
				<AddProductButton categories={categories} warehouses={warehouses} />
			</div>

			<div className='rounded-md border bg-card'>
				<Table>
					<TableHeader>
						<TableRow className='bg-muted/50'>
							<TableHead className='w-[100px]'>Фото</TableHead>
							<TableHead>Название</TableHead>
							<TableHead>Категория</TableHead>
							<TableHead>Цена</TableHead>
							<TableHead>Остаток</TableHead>
							<TableHead>Склады</TableHead>
							<TableHead>Варианты</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead className='text-right'>Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={9}
									className='h-24 text-center text-muted-foreground'
								>
									Товаров пока нет.
								</TableCell>
							</TableRow>
						) : (
							products.map((item: any) => {
								// Берем первое изображение или то, которое помечено как основное
								const mainImage =
									item.images?.find((img: any) => img.isPrimary) ||
									item.images?.[0]

								// Считаем общий остаток по всем складам
								const totalStock = item.stocks?.reduce(
									(sum: number, stock: any) => sum + stock.quantity,
									0,
								) || 0

								// Получаем список складов, где есть товар
								const warehousesWithStock = item.stocks
									?.filter((stock: any) => stock.quantity > 0)
									.map((stock: any) => stock.warehouse)
									.filter(Boolean) || []
								const warehousesCount = warehousesWithStock.length

								// Проверяем наличие вариантов
								const hasVariants = item.hasVariants || false
								const variantsCount = item.productVariants?.length || 0 // Временно отключено
								//const variantsCount = 0 // Будет работать после перегенерации Prisma клиента

								return (
									<TableRow
										key={item.id}
										className='hover:bg-muted/50 transition-colors'
									>
										<TableCell>
											<div className='relative h-12 w-12 overflow-hidden rounded-lg border bg-muted'>
												{mainImage?.url ? (
													<Image
														src={mainImage.url}
														alt={item.name}
														fill
														className='object-cover'
													/>
												) : (
													<div className='flex h-full w-full items-center justify-center'>
														<ImageIcon className='h-6 w-6 text-muted-foreground/50' />
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className='flex flex-col'>
												<span className='font-semibold'>{item.name}</span>
												{item.description && (
													<span className='text-xs text-muted-foreground line-clamp-1'>
														{item.description}
													</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant='outline'>
												{item.category?.name || 'Без категории'}
											</Badge>
										</TableCell>
										<TableCell>
											<span className='font-medium'>
												{Number(item.basePrice).toLocaleString('ru-RU', {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}{' '}
												₽
											</span>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-1.5'>
												<Package className='h-3.5 w-3.5 text-muted-foreground' />
												<span
													className={
														totalStock <= 5
															? 'text-destructive font-bold'
															: totalStock === 0
																? 'text-muted-foreground'
																: ''
													}
												>
													{totalStock}
												</span>
												{totalStock === 0 && (
													<span className='text-xs text-muted-foreground'>
														(нет в наличии)
													</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											{warehousesCount > 0 ? (
												<div className='flex flex-col gap-1'>
													<Badge variant='outline' className='font-normal w-fit'>
														{warehousesCount}{' '}
														{warehousesCount === 1
															? 'склад'
															: warehousesCount < 5
																? 'склада'
																: 'складов'}
													</Badge>
													{warehousesWithStock.length > 0 && (
														<div className='text-xs text-muted-foreground'>
															{warehousesWithStock
																.map((w: any) => w.name)
																.join(', ')}
														</div>
													)}
												</div>
											) : (
												<span className='text-sm text-muted-foreground italic'>
													—
												</span>
											)}
										</TableCell>
										<TableCell>
											{hasVariants ? (
												<Badge variant='secondary' className='font-normal'>
													<Tag className='mr-1 h-3 w-3' />
													{variantsCount} вариантов
												</Badge>
											) : (
												<span className='text-sm text-muted-foreground italic'>
													—
												</span>
											)}
										</TableCell>
										<TableCell>
											{item.isAvailable ? (
												<Badge className='bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none uppercase text-[10px] font-bold'>
													Доступен
												</Badge>
											) : (
												<Badge
													variant='secondary'
													className='uppercase text-[10px] font-bold opacity-70'
												>
													Скрыт
												</Badge>
											)}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												<ToggleProductStatusButton
													productId={item.id}
													isAvailable={item.isAvailable}
												/>
												<AddProductButton
													categories={categories}
													warehouses={warehouses}
													productToEdit={{
														id: item.id,
														name: item.name,
														description: item.description,
														basePrice: Number(item.basePrice),
														categoryId: item.categoryId,
														isAvailable: item.isAvailable,
														hasVariants: item.hasVariants,
														images: item.images,
														variants: item.productVariants?.map((v: any) => ({
															name: v.name,
															additionalPrice: Number(v.additionalPrice),
															stock: v.stock,
															price: Number(v.price),
														})),
														stocks: item.stocks?.map((s: any) => ({
															warehouseId: s.warehouseId,
															quantity: s.quantity,
															warehouse: s.warehouse,
														})),
													}}
												/>
												<DeleteProductButton
													productId={item.id}
													productName={item.name}
												/>
											</div>
										</TableCell>
									</TableRow>
								)
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

