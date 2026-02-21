import AddCategoryButton from '@/components/AddCategoryButton'
import { CategorySocketPicker } from '@/components/CategorySocketPicker'
import { DeleteCategoryButton } from '@/components/DeleteCategoryButton'
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
import { FolderTree, Image as ImageIcon, Layers } from 'lucide-react'
import Image from 'next/image'

export default async function CategoriesPage() {
	const data = await categoryService.getAll()

	// Вспомогательная функция для поиска имени родителя
	const getParentName = (parentId: number | null) => {
		if (!parentId) return null
		return data.find(c => c.id === parentId)?.name
	}

	return (
		<div className='space-y-6 p-6'>
			<CategorySocketPicker />

			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>Категории</h2>
					<p className='text-muted-foreground'>
						Управление структурой каталога и изображениями категорий.
					</p>
				</div>
				<AddCategoryButton categ={data} />
			</div>

			<div className='rounded-md border bg-card'>
				<Table>
					<TableHeader>
						<TableRow className='bg-muted/50'>
							<TableHead className='w-[100px]'>Фото</TableHead>
							<TableHead>Название</TableHead>
							<TableHead>Тип</TableHead>
							<TableHead>Родительская категория</TableHead>
							<TableHead className='text-right'>Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className='h-24 text-center'>
									Категорий пока нет.
								</TableCell>
							</TableRow>
						) : (
							data.map(item => {
								const hasChildren = data.some(
									c => c.parentCategoryId === item.id,
								)
								return (
									<TableRow
										key={item.id}
										className='hover:bg-muted/50 transition-colors'
									>
										<TableCell>
											<div className='relative h-12 w-12 overflow-hidden rounded-lg border bg-muted'>
												{item.categoryImage?.url ? (
													<Image
														src={item.categoryImage.url}
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
											{item.parentCategoryId ? (
												<Badge variant='outline' className='font-normal'>
													<Layers className='mr-1 h-3 w-3' /> Подкатегория
												</Badge>
											) : (
												<Badge variant='secondary' className='font-normal'>
													<FolderTree className='mr-1 h-3 w-3' /> Корневая
												</Badge>
											)}
										</TableCell>
										<TableCell>
											{item.parentCategoryId ? (
												<span className='text-sm text-medium'>
													{getParentName(item.parentCategoryId)}
												</span>
											) : (
												<span className='text-sm text-muted-foreground italic'>
													—
												</span>
											)}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												<AddCategoryButton categ={data} categoryToEdit={item} />

												{/* Теперь hasChildren определена и ошибка исчезнет */}
												<DeleteCategoryButton
													categoryId={item.id}
													categoryName={item.name}
													hasSubcategories={hasChildren}
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
