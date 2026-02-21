'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io as ClientIO } from 'socket.io-client'

type SocketContextType = {
	socket: any | null
	isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	const [socket, setSocket] = useState<any>(null)
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		const initSocket = async () => {
			// 1. Ждем, пока сервер инициализирует сокеты
			const res = await fetch('/api/socket')

			if (res.ok) {
				// 2. Только если сервер ответил 200 OK, создаем инстанс
				const socketInstance = ClientIO({
					path: '/api/socket',
					addTrailingSlash: false,
					// Добавим это, чтобы клиент не спамил бесконечно при ошибке
					reconnectionAttempts: 5,
				})

				socketInstance.on('connect', () => {
					setIsConnected(true)
					console.log('Socket Connected')
				})

				socketInstance.on('disconnect', () => setIsConnected(false))

				setSocket(socketInstance)
			}
		}

		initSocket()

		return () => {
			socket?.disconnect()
		}
	}, [])

	return (
		<SocketContext.Provider value={{ socket, isConnected }}>
			{children}
		</SocketContext.Provider>
	)
}
