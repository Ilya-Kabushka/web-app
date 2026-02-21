'use client'

import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

export function ModeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = React.useState(false)

	// Ждем, пока компонент смонтируется, чтобы избежать ошибок гидратации
	React.useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<Button variant='outline' size='icon' disabled className='opacity-50' />
		)
	}

	// Используем resolvedTheme, так как она учитывает системные настройки
	const isDark = resolvedTheme === 'dark'

	return (
		<Button
			variant='outline'
			size='icon'
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			title={isDark ? 'Включить светлую тему' : 'Включить темную тему'}
		>
			{isDark ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
		</Button>
	)
}
