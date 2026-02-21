import {
	generateUploadButton,
	generateUploadDropzone,
} from '@uploadthing/react'

// Важно: Импортируем ТИП нашего роутера, а не саму логику
import type { OurFileRouter } from '@/app/api/uploadthing/core'

export const UploadButton = generateUploadButton<OurFileRouter>()
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()
