import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
	// Эндпоинт специально для картинок категорий
	categoryImage: f({
		image: { maxFileSize: '4MB', maxFileCount: 1 },
	}).onUploadComplete(async ({ metadata, file }) => {
		console.log('Upload complete for userId:', metadata)
		console.log('file url', file.ufsUrl)
		// Возвращаем URL клиенту
		return { url: file.ufsUrl }
	}),
	// Эндпоинт для картинок товаров (можно загружать несколько)
	productImage: f({
		image: { maxFileSize: '4MB', maxFileCount: 10 },
	}).onUploadComplete(async ({ metadata, file }) => {
		console.log('Upload complete for product image:', file.ufsUrl)
		return { url: file.ufsUrl }
	}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
