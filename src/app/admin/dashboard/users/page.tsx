import AddUserButton from '@/components/AddUserButton'
import { DeleteUserButton } from '@/components/DeleteUserButton'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { usersService } from '@/services/users.service'
import { Mail, Shield, User } from 'lucide-react'
import Image from 'next/image'

const ROLE_LABELS: Record<string, string> = {
	USER: 'Пользователь',
	ADMIN: 'Администратор',
	WAREHOUSE_WORKER: 'Работник склада',
	ANALYTICS: 'Аналитик',
}

const ROLE_COLORS: Record<string, string> = {
	USER: 'bg-blue-100 text-blue-800',
	ADMIN: 'bg-red-100 text-red-800',
	WAREHOUSE_WORKER: 'bg-yellow-100 text-yellow-800',
	ANALYTICS: 'bg-purple-100 text-purple-800',
}

export default async function UsersPage() {
	const users = await usersService.getAll()

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>Пользователи</h2>
					<p className='text-muted-foreground'>
						Управление пользователями, ролями и доступом.
					</p>
				</div>
				<AddUserButton />
			</div>

			<div className='rounded-md border bg-card overflow-hidden'>
				<Table>
					<TableHeader>
						<TableRow className='bg-muted/50'>
							<TableHead className='w-[80px]'>Фото</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Имя</TableHead>
							<TableHead>Роль</TableHead>
							<TableHead>Дата создания</TableHead>
							<TableHead className='text-right'>Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className='h-24 text-center'>
									<div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
										<User className='h-8 w-8 opacity-40' />
										<p>Пользователей еще нет</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							users.map(user => (
								<TableRow key={user.id}>
									<TableCell>
										{user.avatarUrl ? (
											<div className='relative w-12 h-12 rounded-lg overflow-hidden'>
												<Image
													src={user.avatarUrl}
													alt={user.email}
													fill
													className='object-cover'
												/>
											</div>
										) : (
											<div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
												<User className='h-6 w-6 text-muted-foreground' />
											</div>
										)}
									</TableCell>
									<TableCell className='font-medium'>
										<div className='flex items-center gap-2'>
											<Mail className='h-4 w-4 text-muted-foreground' />
											{user.email}
										</div>
									</TableCell>
									<TableCell>
										{user.firstName && user.lastName
											? `${user.firstName} ${user.lastName}`
											: user.firstName || user.lastName || '—'}
									</TableCell>
									<TableCell>
										<Badge className={ROLE_COLORS[user.role]}>
											<Shield className='mr-1 h-3 w-3' />
											{ROLE_LABELS[user.role]}
										</Badge>
									</TableCell>
									<TableCell className='text-sm text-muted-foreground'>
										{new Date(user.createdAt).toLocaleDateString('ru-RU')}
									</TableCell>
									<TableCell className='text-right'>
										<div className='flex items-center justify-end gap-2'>
											<AddUserButton userToEdit={user} />
											<DeleteUserButton
												userId={user.id}
												userName={
													user.firstName && user.lastName
														? `${user.firstName} ${user.lastName}`
														: user.email
												}
											/>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
