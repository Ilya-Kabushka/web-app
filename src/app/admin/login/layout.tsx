// src/app/admin/login/layout.tsx
export default function LoginLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<section className='min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950'>
			{/* Здесь можно добавить фоновый логотип или паттерн */}
			<div className='w-full'>{children}</div>
		</section>
	)
}
