import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function HeroSection() {
	return (
		<section className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border'>
			<div className='container py-16 md:py-24 lg:py-32'>
				<div className='flex flex-col gap-6 max-w-2xl'>
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'>
						Всё, что нужно <br />
						<span className='text-primary'>в одном месте</span>
					</h1>
					<p className='text-lg text-muted-foreground max-w-[600px]'>
						Тысячи товаров по лучшим ценам. Быстрая доставка, гарантия качества
						и удобные способы оплаты.
					</p>
					<div className='flex gap-4'>
						<Button size='lg' asChild>
							<Link href='#products'>Смотреть каталог</Link>
						</Button>
						<Button size='lg' variant='outline'>
							Узнать больше
						</Button>
					</div>
				</div>
			</div>

			{/* Декоративные элементы */}
			<div className='absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl' />
			<div className='absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl' />
		</section>
	)
}
