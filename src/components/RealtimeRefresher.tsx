'use client'
import { useRefreshOnEvent } from '@/hooks/use-refresh-on-event'

export const RealtimeRefresher = ({ eventName }: { eventName: string }) => {
	useRefreshOnEvent(eventName)
	return null
}
