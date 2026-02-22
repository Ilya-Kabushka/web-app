import { QueryProvider } from '@/components/provider/query-provider'
import { AuthProvider } from '@/components/providers/session-provider'
import './globals.css'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='ru'>
			<body>
				<QueryProvider>
					<AuthProvider>{children}</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
