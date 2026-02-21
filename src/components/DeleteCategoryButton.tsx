'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteCategoryAction } from '@/server-actions/categories.action'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeleteCategoryButtonProps {
	categoryId: number
	categoryName: string
	hasSubcategories: boolean
}

export function DeleteCategoryButton({
	categoryId,
	categoryName,
	hasSubcategories,
}: DeleteCategoryButtonProps) {
	const [isLoading, setIsLoading] = useState(false)

	const onDelete = async () => {
		setIsLoading(true)
		const result = await deleteCategoryAction(categoryId)
		setIsLoading(false)

		if (result.success) {
			toast.success(`Категория "${categoryName}" удалена`)
		} else {
			toast.error(result.error)
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant='ghost'
					size='icon'
					className='text-destructive hover:bg-destructive/10'
				>
					<Trash2 className='h-4 w-4' />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className='flex items-center gap-2'>
						<AlertTriangle className='h-5 w-5 text-destructive' />
						Вы уверены?
					</AlertDialogTitle>
					<AlertDialogDescription className='space-y-3'>
						<p>
							Вы собираетесь удалить категорию <strong>"{categoryName}"</strong>
							.
						</p>

						{hasSubcategories && (
							<div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive font-medium text-sm'>
								Внимание: У этой категории есть подкатегории. При удалении
								родителя, связь будет разорвана, и подкатегории станут
								самостоятельными (корневыми).
							</div>
						)}

						<p>Это действие нельзя будет отменить.</p>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Отмена</AlertDialogCancel>
					<AlertDialogAction
						onClick={onDelete}
						className='bg-destructive text-white hover:bg-destructive/90'
						disabled={isLoading}
					>
						{isLoading ? 'Удаление...' : 'Удалить'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
