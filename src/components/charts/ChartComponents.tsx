'use client'

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

const COLORS = [
	'#3b82f6',
	'#ef4444',
	'#10b981',
	'#f59e0b',
	'#8b5cf6',
	'#ec4899',
	'#14b8a6',
	'#f97316',
]

export function BarChartComponent({
	data,
	dataKey,
	nameKey = 'name',
	title,
}: {
	data: any[]
	dataKey: string
	nameKey?: string
	title?: string
}) {
	return (
		<div className='w-full h-full'>
			{title && <h3 className='text-lg font-semibold mb-4'>{title}</h3>}
			<ResponsiveContainer width='100%' height={300}>
				<BarChart data={data}>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis dataKey={nameKey} angle={-45} textAnchor='end' height={80} />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey={dataKey} fill='#3b82f6' />
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}

export function LineChartComponent({
	data,
	dataKey,
	dataKey2,
	nameKey = 'name',
	title,
}: {
	data: any[]
	dataKey: string
	dataKey2?: string
	nameKey?: string
	title?: string
}) {
	return (
		<div className='w-full h-full'>
			{title && <h3 className='text-lg font-semibold mb-4'>{title}</h3>}
			<ResponsiveContainer width='100%' height={300}>
				<LineChart data={data}>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis dataKey={nameKey} />
					<YAxis />
					<Tooltip />
					<Legend />
					<Line
						type='monotone'
						dataKey={dataKey}
						stroke='#3b82f6'
						strokeWidth={2}
					/>
					{dataKey2 && (
						<Line
							type='monotone'
							dataKey={dataKey2}
							stroke='#ef4444'
							strokeWidth={2}
						/>
					)}
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}

export function PieChartComponent({
	data,
	dataKey,
	nameKey = 'name',
	title,
}: {
	data: any[]
	dataKey: string
	nameKey?: string
	title?: string
}) {
	return (
		<div className='w-full h-full'>
			{title && <h3 className='text-lg font-semibold mb-4'>{title}</h3>}
			<ResponsiveContainer width='100%' height={300}>
				<PieChart>
					<Pie
						data={data}
						dataKey={dataKey}
						nameKey={nameKey}
						cx='50%'
						cy='50%'
						labelLine={true}
						label={{ position: 'right', offset: 10 }}
						outerRadius={100}
					>
						{data.map((_, index) => (
							<Cell
								key={`cell-${index}`}
								fill={COLORS[index % COLORS.length]}
							/>
						))}
					</Pie>
					<Tooltip />
				</PieChart>
			</ResponsiveContainer>
		</div>
	)
}
