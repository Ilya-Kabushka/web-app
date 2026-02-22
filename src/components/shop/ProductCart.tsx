import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'

// Опишем тип пропсов, чтобы TypeScript нам помогал
interface ProductCardProps {
	product: {
		id: string | number
		name: string
		description?: string | null
		price: number
		imageUrl?: string | null
	}
}

export function ProductCard({ product }: ProductCardProps) {
	// Безопасное форматирование цены
	const formattedPrice = new Intl.NumberFormat('ru-RU').format(
		Number(product.price) || 0,
	)

	return (
		<Card className='group flex flex-col justify-between bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
			{/* Изображение */}
			<div className='relative aspect-square bg-slate-50 overflow-hidden'>
				{product.imageUrl ? (
					<Image
						src={product.imageUrl}
						alt={product.name}
						fill
						className='object-cover transition-transform duration-500 group-hover:scale-105'
					/>
				) : (
					<div className='absolute inset-0 flex items-center justify-center text-slate-300 text-sm'>
						Нет фото
					</div>
				)}
			</div>

			{/* Описание */}
			<CardContent className='p-5 flex-grow'>
				<h3 className='font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors'>
					{product.name}
				</h3>
				<p className='text-sm text-slate-500 mt-2 line-clamp-2 h-10'>
					{product.description || 'Отличный выбор для каждого.'}
				</p>
			</CardContent>

			{/* Цена и кнопка */}
			<CardFooter className='p-5 pt-0 flex items-center justify-between'>
				<div>
					<p className='text-xs text-slate-400 font-medium uppercase tracking-wider mb-1'>
						Цена
					</p>
					<p className='text-xl font-black text-slate-900'>
						{formattedPrice} <span className='text-sm font-medium'>₽</span>
					</p>
				</div>
				<Button
					size='icon'
					className='h-10 w-10 rounded-xl bg-slate-900 hover:bg-blue-600 transition-colors'
				>
					<ShoppingCart className='w-4 h-4' />
				</Button>
			</CardFooter>
		</Card>
	)
}
