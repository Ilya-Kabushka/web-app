'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/formatters'
import { useCartStore } from '@/store/use-cart-store'
import {
	ChevronLeft,
	ChevronRight,
	Heart,
	RotateCcw,
	Share2,
	Shield,
	ShoppingCart,
	Star,
	Truck,
} from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ProductImage {
	id: number
	url: string
	isPrimary: boolean
}

interface Product {
	id: number
	name: string
	description?: string
	basePrice: number
	averageRating: number
	isAvailable: boolean
	images: ProductImage[]
	category?: {
		name: string
	}
}

interface Review {
	id: number
	rating: number
	comment?: string
	authorName: string
	createdAt: string
}

export default function ProductPage() {
	const params = useParams()
	const router = useRouter()
	const productId = parseInt(params.product as string)

	const [product, setProduct] = useState<Product | null>(null)
	const [reviews, setReviews] = useState<Review[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [quantity, setQuantity] = useState(1)
	const [isFavorite, setIsFavorite] = useState(false)

	const addItem = useCartStore(state => state.addItem)

	useEffect(() => {
		fetchProduct()
		fetchReviews()
	}, [productId])

	const fetchProduct = async () => {
		try {
			setIsLoading(true)
			const response = await fetch(`/api/products/${productId}`)
			if (!response.ok) throw new Error('Product not found')
			const data = await response.json()
			setProduct(data)
		} catch (error) {
			console.error('Failed to fetch product:', error)
			toast.error('Товар не найден')
			router.back()
		} finally {
			setIsLoading(false)
		}
	}

	const fetchReviews = async () => {
		try {
			const response = await fetch(`/api/products/${productId}/reviews`)
			if (response.ok) {
				const data = await response.json()
				setReviews(data)
			}
		} catch (error) {
			console.error('Failed to fetch reviews:', error)
		}
	}

	const handleAddToCart = () => {
		if (!product?.isAvailable) {
			toast.error('Товар недоступен')
			return
		}

		for (let i = 0; i < quantity; i++) {
			addItem(productId)
		}
		toast.success(`Добавлено в корзину (${quantity} шт.)`)
		setQuantity(1)
	}

	const handleNextImage = () => {
		if (product?.images) {
			setCurrentImageIndex(prev => (prev + 1) % product.images.length)
		}
	}

	const handlePrevImage = () => {
		if (product?.images) {
			setCurrentImageIndex(
				prev => (prev - 1 + product.images.length) % product.images.length,
			)
		}
	}

	if (isLoading) {
		return (
			<div className='container py-8'>
				<div className='text-center'>Загрузка...</div>
			</div>
		)
	}

	if (!product) return null

	const currentImage =
		product.images?.[currentImageIndex]?.url || '/placeholder.jpg'
	const hasMultipleImages = product.images && product.images.length > 1

	const averageRating = Number(product.averageRating) || 0
	const ratingPercentage = (averageRating / 5) * 100

	return (
		<div className='container py-8'>
			{/* Breadcrumb */}
			<div className='flex items-center gap-2 text-sm text-muted-foreground mb-8'>
				<button onClick={() => router.back()} className='hover:text-primary'>
					← Назад
				</button>
				{product.category && (
					<>
						<span>/</span>
						<span>{product.category.name}</span>
					</>
				)}
				<span>/</span>
				<span className='text-foreground'>{product.name}</span>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
				{/* Product Images */}
				<div>
					<div className='relative bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-square'>
						<Image
							src={currentImage}
							alt={product.name}
							fill
							className='object-contain p-4'
						/>

						{hasMultipleImages && product.images.length > 1 && (
							<>
								<button
									onClick={handlePrevImage}
									className='absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full'
									aria-label='Previous image'
								>
									<ChevronLeft className='h-5 w-5' />
								</button>
								<button
									onClick={handleNextImage}
									className='absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full'
									aria-label='Next image'
								>
									<ChevronRight className='h-5 w-5' />
								</button>
								<div className='absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1 rounded-full'>
									{currentImageIndex + 1} / {product.images.length}
								</div>
							</>
						)}
					</div>

					{/* Thumbnail Images */}
					{product.images && product.images.length > 1 && (
						<div className='flex gap-2 overflow-x-auto'>
							{product.images.map((img, idx) => (
								<button
									key={img.id}
									onClick={() => setCurrentImageIndex(idx)}
									className={`flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-colors ${
										idx === currentImageIndex
											? 'border-primary'
											: 'border-gray-200 hover:border-gray-300'
									}`}
								>
									<Image
										src={img.url}
										alt={`${product.name} ${idx}`}
										width={80}
										height={80}
										className='object-cover w-full h-full'
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Product Info */}
				<div className='space-y-6'>
					{/* Title and Category */}
					<div>
						<div className='flex items-center gap-2 mb-2'>
							{product.category && (
								<Badge variant='secondary'>{product.category.name}</Badge>
							)}
							{!product.isAvailable && (
								<Badge variant='destructive'>Недоступен</Badge>
							)}
						</div>
						<h1 className='text-3xl lg:text-4xl font-bold'>{product.name}</h1>
					</div>

					{/* Rating */}
					<div className='flex items-center gap-4'>
						<div className='flex items-center gap-1'>
							<div className='flex gap-0.5'>
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`h-4 w-4 ${
											i < Math.round(averageRating)
												? 'fill-yellow-400 text-yellow-400'
												: 'text-gray-300'
										}`}
									/>
								))}
							</div>
							<span className='text-sm text-muted-foreground ml-2'>
								{averageRating.toFixed(1)} ({reviews.length} отзывов)
							</span>
						</div>
					</div>

					{/* Price */}
					<div className='border-b pb-6'>
						<div className='text-3xl font-bold text-primary'>
							{formatPrice(product.basePrice)}
						</div>
						<p className='text-sm text-muted-foreground mt-2'>
							Цена может измениться при оформлении заказа
						</p>
					</div>

					{/* Description */}
					{product.description && (
						<div>
							<h3 className='font-semibold mb-2'>Описание</h3>
							<p className='text-muted-foreground'>{product.description}</p>
						</div>
					)}

					{/* Info Cards */}
					<div className='grid grid-cols-3 gap-3'>
						<Card>
							<CardContent className='p-3 text-center'>
								<Truck className='h-5 w-5 mx-auto mb-1 text-primary' />
								<p className='text-xs font-medium'>Бесплатная доставка</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='p-3 text-center'>
								<RotateCcw className='h-5 w-5 mx-auto mb-1 text-primary' />
								<p className='text-xs font-medium'>Возврат за 30 дней</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className='p-3 text-center'>
								<Shield className='h-5 w-5 mx-auto mb-1 text-primary' />
								<p className='text-xs font-medium'>Гарантия</p>
							</CardContent>
						</Card>
					</div>

					{/* Quantity and Add to Cart */}
					<div className='space-y-4'>
						<div className='flex items-center gap-4'>
							<div className='flex items-center border rounded-lg'>
								<button
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									className='px-3 py-2 hover:bg-gray-100'
								>
									−
								</button>
								<input
									type='number'
									value={quantity}
									onChange={e => {
										const val = parseInt(e.target.value) || 1
										setQuantity(Math.max(1, val))
									}}
									className='w-12 text-center border-0 focus:ring-0 py-2'
									min='1'
								/>
								<button
									onClick={() => setQuantity(quantity + 1)}
									className='px-3 py-2 hover:bg-gray-100'
								>
									+
								</button>
							</div>
						</div>

						<div className='flex gap-3 flex-col sm:flex-row'>
							<Button
								onClick={handleAddToCart}
								disabled={!product.isAvailable}
								size='lg'
								className='flex-1'
							>
								<ShoppingCart className='h-5 w-5 mr-2' />
								Добавить в корзину
							</Button>
							<Button
								onClick={() => setIsFavorite(!isFavorite)}
								variant='outline'
								size='lg'
								className='sm:w-auto'
							>
								<Heart
									className={`h-5 w-5 ${
										isFavorite ? 'fill-red-500 text-red-500' : ''
									}`}
								/>
							</Button>
							<Button variant='outline' size='lg' className='sm:w-auto'>
								<Share2 className='h-5 w-5' />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Reviews Section */}
			{reviews.length > 0 && (
				<div className='border-t pt-8'>
					<h2 className='text-2xl font-bold mb-6'>Отзывы ({reviews.length})</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{reviews.map(review => (
							<Card key={review.id}>
								<CardContent className='p-4'>
									<div className='flex gap-1 mb-2'>
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												className={`h-3 w-3 ${
													i < review.rating
														? 'fill-yellow-400 text-yellow-400'
														: 'text-gray-300'
												}`}
											/>
										))}
									</div>
									<p className='font-medium mb-1'>{review.authorName}</p>
									{review.comment && (
										<p className='text-sm text-muted-foreground'>
											{review.comment}
										</p>
									)}
									<p className='text-xs text-muted-foreground mt-2'>
										{new Date(review.createdAt).toLocaleDateString('ru-RU')}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
