'use client'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

interface Column<T> {
	key: keyof T
	label: string
	format?: (value: any) => string
}

export function DataTable<T extends Record<string, any>>({
	data,
	columns,
	title,
	maxHeight,
}: {
	data: T[]
	columns: Column<T>[]
	title?: string
	maxHeight?: string
}) {
	if (data.length === 0) {
		return (
			<div className='w-full'>
				{title && <h3 className='text-lg font-semibold mb-4'>{title}</h3>}
				<div className='text-center py-8 text-muted-foreground'>
					Нет данных для отображения
				</div>
			</div>
		)
	}

	return (
		<div className='w-full'>
			{title && <h3 className='text-lg font-semibold mb-4'>{title}</h3>}
			<div
				className={`border rounded-lg overflow-x-auto ${maxHeight ? `max-h-[${maxHeight}] overflow-y-auto` : ''}`}
			>
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map(col => (
								<TableHead key={String(col.key)} className='font-semibold'>
									{col.label}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((row, idx) => (
							<TableRow key={idx}>
								{columns.map(col => (
									<TableCell key={String(col.key)}>
										{col.format
											? col.format(row[col.key])
											: String(row[col.key])}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

export function StatsCard({
	label,
	value,
	unit,
	icon,
	className,
}: {
	label: string
	value: string | number
	unit?: string
	icon?: React.ReactNode
	className?: string
}) {
	return (
		<div
			className={`bg-white dark:bg-slate-900 border rounded-lg p-6 ${className}`}
		>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-sm text-muted-foreground font-medium'>{label}</p>
					<p className='text-2xl font-bold mt-2'>
						{value}
						{unit && (
							<span className='text-lg text-muted-foreground ml-1'>{unit}</span>
						)}
					</p>
				</div>
				{icon && <div className='text-4xl opacity-20'>{icon}</div>}
			</div>
		</div>
	)
}
