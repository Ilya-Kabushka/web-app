import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { MENU_ADMIN } from '@/lib/links'
import { ChevronDown } from 'lucide-react'

export default function AppSidebar({ user }: { user: any }) {
	return (
		<Sidebar collapsible='icon'>
			{/* ШАПКА С ПРОФИЛЕМ */}
			<SidebarHeader className='p-4'>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size='lg'
									className='data-[state=open]:bg-sidebar-accent'
								>
									{/* Заглушка аватара */}
									<Avatar className='h-8 w-8 rounded-lg'>
										<AvatarImage src={user.avatar} />
										<AvatarFallback>ИЛ</AvatarFallback>
									</Avatar>

									{/* Эти данные скроются при сворачивании автоматически! */}
									<div className='grid flex-1 text-left text-sm leading-tight'>
										<span className='truncate font-semibold'>{user.name}</span>
										<span className='truncate text-xs'>{user.email}</span>
									</div>
									<ChevronDown className='ml-auto size-4' />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
								align='start'
							>
								<DropdownMenuItem>Профиль</DropdownMenuItem>
								<DropdownMenuItem>Настройки</DropdownMenuItem>
								<DropdownMenuItem className='text-red-500'>
									Выйти
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					{MENU_ADMIN.map(item => {
						return (
							<SidebarMenuButton asChild key={item.href}>
								<a href={item.href}>
									<item.icon />
									<span>{item.label}</span>
								</a>
							</SidebarMenuButton>
						)
					})}
				</SidebarGroup>
				<SidebarGroup />
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	)
}
