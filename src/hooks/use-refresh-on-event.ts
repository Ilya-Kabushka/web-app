'use client'

import { useSocket } from '@/providers/socket-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useRefreshOnEvent = (eventName: string) => {
	const { socket } = useSocket()
	const router = useRouter()

	useEffect(() => {
		if (!socket) return

		socket.on(eventName, () => {
			// Обновляем серверные компоненты без перезагрузки страницы
			router.refresh()
		})

		return () => {
			socket.off(eventName)
		}
	}, [socket, eventName, router])
}
