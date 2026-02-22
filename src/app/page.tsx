'use client'

import { ProductCard } from '@/components/shop/ProductCart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowRight, RotateCcw, Search, Shield, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Product {
	id: number
	name: string
	basePrice: string
	averageRating: string
	isAvailable: boolean
	images: Array<{ url: string; isPrimary?: boolean }>
	category?: { name: string }
}

interface Category {
	id: number
	name: string
	description?: string
	categoryImage?: { url: string }
	_count?: { products: number }
}

export default function HomePage() {
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [productsRes, categoriesRes] = await Promise.all([
					fetch('/api/products?limit=8'),
					fetch('/api/categories'),
				])

				if (productsRes.ok) {
					const data = await productsRes.json()
					setProducts(data.products || [])
				}

				if (categoriesRes.ok) {
					const data = await categoriesRes.json()
					const categoriesList = Array.isArray(data)
						? data
						: data.categories || []
					setCategories(categoriesList.slice(0, 6))
				}
			} catch (error) {
				console.error('Error fetching data:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
		}
	}

	return (
		<main className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
			{/* Hero Section */}
			<section className='relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 py-20 sm:py-32'>
				<div className='absolute inset-0 overflow-hidden'>
					<div className='absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl'></div>
					<div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl'></div>
				</div>

				<div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='grid gap-12 lg:grid-cols-2 lg:items-center'>
						{/* Text Content */}
						<div className='text-white'>
							<h1 className='text-4xl font-bold sm:text-5xl lg:text-6xl'>
								Добро пожаловать в <br />
								<span className='text-blue-100'>наш магазин</span>
							</h1>
							<p className='mt-4 text-lg text-blue-100 sm:text-xl'>
								Найдите лучшие товары по выгодным ценам. Качество, которое вы
								можете доверять.
							</p>

							{/* Search Bar */}
							<form
								onSubmit={handleSearch}
								className='mt-8 flex items-center gap-2 rounded-full bg-white p-1 shadow-lg'
							>
								<Input
									type='text'
									placeholder='Что вы ищете?'
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className='border-0 bg-transparent pl-4 focus-visible:ring-0'
								/>
								<Button
									type='submit'
									size='icon'
									className='h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700'
								>
									<Search className='h-5 w-5' />
								</Button>
							</form>

							{/* CTA Buttons */}
							<div className='mt-8 flex flex-col gap-4 sm:flex-row'>
								<Link href='/shop'>
									<Button
										size='lg'
										className='w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50'
									>
										Перейти в магазин
										<ArrowRight className='ml-2 h-5 w-5' />
									</Button>
								</Link>
								<Link href='/about'>
									<Button
										size='lg'
										variant='outline'
										className='w-full sm:w-auto border-white text-white hover:bg-blue-700'
									>
										Узнать больше
									</Button>
								</Link>
							</div>
						</div>

						{/* Hero Image */}
						<div className='relative hidden lg:block'>
							<div className='relative h-96 w-full'>
								<div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm'></div>
								<div className='flex h-full items-center justify-center'>
									<div className='text-center text-white'>
										<h2 className='text-3xl font-bold'>Лучшее качество</h2>
										<p className='mt-2 text-blue-100'>Доступно для всех</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
						{/* Feature 1 */}
						<Card className='border-0 bg-white/50 backdrop-blur-sm'>
							<CardContent className='p-6'>
								<div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100'>
									<Truck className='h-6 w-6 text-blue-600' />
								</div>
								<h3 className='text-xl font-semibold'>Быстрая доставка</h3>
								<p className='mt-2 text-muted-foreground'>
									Доставим ваш заказ в кратчайшие сроки по лучшим ценам
								</p>
							</CardContent>
						</Card>

						{/* Feature 2 */}
						<Card className='border-0 bg-white/50 backdrop-blur-sm'>
							<CardContent className='p-6'>
								<div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100'>
									<Shield className='h-6 w-6 text-green-600' />
								</div>
								<h3 className='text-xl font-semibold'>Безопасные покупки</h3>
								<p className='mt-2 text-muted-foreground'>
									Защита данных и гарантия возврата денежных средств
								</p>
							</CardContent>
						</Card>

						{/* Feature 3 */}
						<Card className='border-0 bg-white/50 backdrop-blur-sm sm:col-span-2 lg:col-span-1'>
							<CardContent className='p-6'>
								<div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100'>
									<RotateCcw className='h-6 w-6 text-amber-600' />
								</div>
								<h3 className='text-xl font-semibold'>Просто вернуть</h3>
								<p className='mt-2 text-muted-foreground'>
									30 дней на возврат без причин и объяснений
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Categories Section */}
			{categories.length > 0 && (
				<section className='px-4 py-16 sm:px-6 lg:px-8'>
					<div className='mx-auto max-w-7xl'>
						<div className='flex items-center justify-between'>
							<h2 className='text-3xl font-bold'>Категории</h2>
							<Link href='/shop'>
								<Button variant='outline'>
									Все категории
									<ArrowRight className='ml-2 h-4 w-4' />
								</Button>
							</Link>
						</div>

						<div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
							{categories.map(category => (
								<Link key={category.id} href={`/shop?category=${category.id}`}>
									<Card className='group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
										<CardContent className='p-0'>
											{category.categoryImage?.url ? (
												<div className='relative aspect-video overflow-hidden bg-muted'>
													<Image
														src={category.categoryImage.url}
														alt={category.name}
														fill
														className='object-cover transition-transform duration-300 group-hover:scale-110'
													/>
													<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'></div>
													<div className='absolute bottom-0 left-0 right-0 p-4'>
														<h3 className='text-lg font-semibold text-white'>
															{category.name}
														</h3>
														<p className='text-sm text-gray-200'>
															Перейти в категорию →
														</p>
													</div>
												</div>
											) : (
												<div className='flex aspect-video items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-6'>
													<div className='text-center text-white'>
														<h3 className='text-lg font-semibold'>
															{category.name}
														</h3>
														<p className='text-sm text-blue-100'>Перейти →</p>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Products Section */}
			<section className='px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<div className='flex items-center justify-between'>
						<div>
							<h2 className='text-3xl font-bold'>Рекомендуемые товары</h2>
							<p className='mt-2 text-muted-foreground'>
								Самые популярные и востребованные товары нашего магазина
							</p>
						</div>
						<Link href='/shop'>
							<Button variant='outline'>
								Все товары
								<ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						</Link>
					</div>

					{loading ? (
						<div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
							{[...Array(8)].map((_, i) => (
								<Card key={i} className='animate-pulse'>
									<CardContent className='p-4'>
										<div className='aspect-square rounded bg-muted'></div>
										<div className='mt-4 space-y-2'>
											<div className='h-4 rounded bg-muted'></div>
											<div className='h-4 w-3/4 rounded bg-muted'></div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : products.length > 0 ? (
						<div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
							{products.map(product => (
								<ProductCard
									key={product.id}
									id={product.id}
									name={product.name}
									basePrice={product.basePrice}
									averageRating={product.averageRating}
									imageUrl={
										product.images?.[0]?.url ||
										'https://via.placeholder.com/400x400?text=No+Image'
									}
									isAvailable={product.isAvailable}
									category={product.category}
								/>
							))}
						</div>
					) : (
						<div className='mt-8 flex min-h-[400px] items-center justify-center rounded-lg border border-dashed bg-muted/50'>
							<p className='text-center text-muted-foreground'>
								Товары еще не добавлены. Вернитесь позже!
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Newsletter Section */}
			<section className='bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-2xl text-center'>
					<h2 className='text-3xl font-bold text-white'>
						Подпишитесь на новости
					</h2>
					<p className='mt-4 text-lg text-blue-100'>
						Получайте эксклюзивные предложения и скидки прямо на почту
					</p>

					<form
						onSubmit={e => {
							e.preventDefault()
							// TODO: Реализовать подписку на рассылку
						}}
						className='mt-8 flex flex-col gap-3 sm:flex-row'
					>
						<Input
							type='email'
							placeholder='Введите вашу почту'
							className='bg-white pl-4'
							required
						/>
						<Button
							type='submit'
							size='lg'
							className='w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50'
						>
							Подписаться
						</Button>
					</form>
				</div>
			</section>

			{/* Footer CTA */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<Card className='border-0 bg-gradient-to-r from-blue-50 to-indigo-50'>
						<CardContent className='p-8'>
							<div className='grid gap-8 sm:grid-cols-2'>
								<div>
									<h3 className='text-2xl font-bold'>Остались вопросы?</h3>
									<p className='mt-2 text-muted-foreground'>
										Наша команда поддержки готова помочь вам 24/7
									</p>
									<Link href='/contact'>
										<Button className='mt-4' variant='default'>
											Связаться с нами
										</Button>
									</Link>
								</div>
								<div>
									<h3 className='text-2xl font-bold'>
										Специальные предложения
									</h3>
									<p className='mt-2 text-muted-foreground'>
										Следите за нашими акциями и получайте до 50% скидку
									</p>
									<Link href='/promotions'>
										<Button className='mt-4' variant='default'>
											Смотреть акции
										</Button>
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	)
}
