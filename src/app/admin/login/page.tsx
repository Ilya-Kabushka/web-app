'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Импортируем компоненты shadcn (проверь пути, если у тебя они в другой папке)
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// 1. Описываем схему валидации через Zod
const formSchema = z.object({
	email: z.string().email({ message: 'Введите корректный email адрес' }),
	password: z
		.string()
		.min(6, { message: 'Пароль должен быть не короче 6 символов' }),
})

export default function AdminLoginPage() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// 2. Инициализируем форму
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	// 3. Обработчик отправки
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true)
		setError(null)

		try {
			// Вызываем NextAuth с провайдером credentials
			const result = await signIn('credentials', {
				email: values.email,
				password: values.password,
				redirect: false, // Отключаем авто-редирект, чтобы обработать ошибки
			})

			if (result?.error) {
				setError('Неверный email или пароль')
			} else {
				// Если всё ок, пускаем в дашборд и обновляем роутер
				router.push('/admin/dashboard')
				router.refresh()
			}
		} catch (err) {
			setError('Произошла ошибка при входе. Попробуйте позже.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50/50 p-4'>
			<Card className='w-full max-w-md shadow-lg'>
				<CardHeader className='space-y-1 text-center'>
					<CardTitle className='text-2xl font-bold tracking-tight'>
						Вход в панель
					</CardTitle>
					<CardDescription>
						Введите свой email и пароль для доступа к админке
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder='admin@example.com'
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Пароль</FormLabel>
										<FormControl>
											<Input
												type='password'
												placeholder='••••••••'
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Вывод ошибки от сервера */}
							{error && (
								<div className='text-sm font-medium text-destructive text-center'>
									{error}
								</div>
							)}

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? 'Вход...' : 'Войти'}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
