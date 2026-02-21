import AddWarehouseButton from '@/components/AddWarehouseButton'
import { DeleteWarehouseButton } from '@/components/DeleteWarehouseButton'
import { ManageWarehouseWorkersButton } from '@/components/ManageWarehouseWorkersButton'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { warehouseService } from '@/services/warehouses.service'
import { MapPin, Package, Users } from 'lucide-react'

export default async function WarehousesPage() {
	const warehouses = await warehouseService.getAll()

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>Склады</h2>
					<p className='text-muted-foreground'>
						Управление складами и закрепление сотрудников.
					</p>
				</div>
				<AddWarehouseButton />
			</div>

			<div className='rounded-md border bg-card'>
				<Table>
					<TableHeader>
						<TableRow className='bg-muted/50'>
							<TableHead>Название</TableHead>
							<TableHead>Адрес</TableHead>
							<TableHead>Сотрудники</TableHead>
							<TableHead>Товары</TableHead>
							<TableHead className='text-right'>Действия</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{warehouses.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className='h-24 text-center text-muted-foreground'
								>
									Складов пока нет.
								</TableCell>
							</TableRow>
						) : (
							warehouses.map((warehouse: any) => {
								const workersCount = warehouse.workers?.length || 0
								const stocksCount = warehouse.stocks?.length || 0

								return (
									<TableRow
										key={warehouse.id}
										className='hover:bg-muted/50 transition-colors'
									>
										<TableCell>
											<div className='flex flex-col'>
												<span className='font-semibold'>{warehouse.name}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-1.5'>
												<MapPin className='h-3.5 w-3.5 text-muted-foreground' />
												<span className='text-sm'>{warehouse.location}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-1.5'>
												<Users className='h-3.5 w-3.5 text-muted-foreground' />
												<Badge variant='secondary' className='font-normal'>
													{workersCount} сотрудников
												</Badge>
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center gap-1.5'>
												<Package className='h-3.5 w-3.5 text-muted-foreground' />
												<span className='text-sm'>
													{stocksCount} позиций
												</span>
											</div>
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												<ManageWarehouseWorkersButton
													warehouseId={warehouse.id}
													warehouseName={warehouse.name}
													workers={warehouse.workers || []}
												/>
												<AddWarehouseButton warehouseToEdit={warehouse} />
												<DeleteWarehouseButton
													warehouseId={warehouse.id}
													warehouseName={warehouse.name}
													hasStocks={stocksCount > 0}
													hasWorkers={workersCount > 0}
												/>
											</div>
										</TableCell>
									</TableRow>
								)
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

