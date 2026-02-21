import { createRouteHandler } from 'uploadthing/next'
import { ourFileRouter } from './core' // Мы импортируем твой роутер из соседнего файла core.ts

// Это создаёт обработчики для GET и POST запросов
export const { GET, POST } = createRouteHandler({
	router: ourFileRouter,
	// В будущем здесь можно добавить дополнительные конфиги, например callback-логи
})
