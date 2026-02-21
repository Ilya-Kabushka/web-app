import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'

export const config = {
	api: {
		bodyParser: false,
	},
}

const handler = (req: NextApiRequest, res: any) => {
	if (!res.socket.server.io) {
		console.log('--- Инициализация Socket.io сервера ---')
		const httpServer: NetServer = res.socket.server
		const io = new ServerIO(httpServer, {
			path: '/api/socket',
			addTrailingSlash: false,
		})
		res.socket.server.io = io

		io.on('connection', socket => {
			console.log('Клиент подключился:', socket.id)

			// Слушаем сигнал об обновлении данных
			socket.on('update-data', () => {
				// Рассылаем всем остальным сигнал "пора обновиться"
				socket.broadcast.emit('refresh')
			})
		})
	}
	res.end()
}

export default handler
