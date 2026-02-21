'use client'

import { useSocket } from '@/providers/socket-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function CategorySocketPicker() {
	const { socket } = useSocket()
	const router = useRouter()

	useEffect(() => {
		if (!socket) return

		// Когда сервер сокетов скажет 'refresh',
		// Next.js просто перечитает серверный компонент CategoriesPage
		socket.on('refresh', () => {
			router.refresh()
		})

		return () => {
			socket.off('refresh')
		}
	}, [socket, router])

	return null // Компонент ничего не рисует, он просто "слушает"
}
