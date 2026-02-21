# 🔌 API Заказов

## Server Actions

### createOrderAction

Создание заказа из корзины пользователя.

```typescript
export async function createOrderAction(
	userId: number,
	addressId: number,
	paymentMethodId?: number,
	promocodeCode?: string,
): Promise<{
	success?: boolean
	orderId?: number
	error?: string
}>
```

**Параметры:**

- `userId` - ID пользователя
- `addressId` - ID адреса доставки
- `paymentMethodId` - ID способа оплаты (опционально)
- `promocodeCode` - Код промокода (опционально)

**Возвращает:**

- `success: true` и `orderId` при успехе
- `error` при ошибке

**Ошибки:**

- "Корзина пуста"
- "Адрес доставки не найден"
- "Промокод не найден"
- "Промокод больше не действителен"

---

### updateOrderStatusAction

Изменение статуса заказа.

```typescript
export async function updateOrderStatusAction(
	orderId: number,
	status: string,
): Promise<{
	success?: boolean
	error?: string
}>
```

**Статусы:**

- `PENDING` - Ожидание
- `PROCESSING` - В обработке
- `SHIPPED` - Отправлено
- `DELIVERED` - Доставлено
- `CANCELED` - Отменено

---

### cancelOrderAction

Отмена заказа.

```typescript
export async function cancelOrderAction(orderId: number): Promise<{
	success?: boolean
	error?: string
}>
```

**Ошибки:**

- "Заказ не найден"
- "Невозможно отменить заказ с этим статусом"

---

### getOrderDetailsAction

Получение деталей заказа.

```typescript
export async function getOrderDetailsAction(orderId: number): Promise<{
	success?: boolean
	order?: Order
	error?: string
}>
```

---

### getUserOrdersAction

Получение всех заказов пользователя.

```typescript
export async function getUserOrdersAction(userId: number): Promise<{
	success?: boolean
	orders?: Order[]
	error?: string
}>
```

---

## Service Methods

### orderService.getAll()

Получить все заказы (админ).

```typescript
const orders = await orderService.getAll()
```

**Возвращает:** `Order[]` со всеми связями

---

### orderService.getByUserId(userId)

Получить заказы конкретного пользователя.

```typescript
const userOrders = await orderService.getByUserId(123)
```

---

### orderService.getById(orderId)

Получить детали заказа по ID.

```typescript
const order = await orderService.getById(456)
```

---

### orderService.createFromCart(data)

Создать заказ из корзины (используется в action).

```typescript
const order = await orderService.createFromCart({
	userId: 123,
	addressId: 456,
	deliveryCity: 'Минск',
	deliveryStreet: 'ул. Ленина, 10',
	promocodeId: 1,
	paymentMethodId: 2,
	items: [
		{ productId: 1, quantity: 2, priceAtPurchase: 100 },
		{ productId: 2, quantity: 1, priceAtPurchase: 50 },
	],
})
```

---

### orderService.updateStatus(orderId, status)

Обновить статус заказа.

```typescript
const updated = await orderService.updateStatus(123, 'SHIPPED')
```

---

### orderService.cancel(orderId)

Отменить заказ.

```typescript
const cancelled = await orderService.cancel(123)
```

**Выбросит ошибку если:**

- Заказ не найден
- Статус не PENDING или PROCESSING

---

### orderService.getStatistics()

Получить статистику заказов.

```typescript
const stats = await orderService.getStatistics()
// {
//   totalOrders: 150,
//   ordersByStatus: [...],
//   totalRevenue: 15000,
//   averageOrderValue: 100
// }
```

---

### orderService.search(query)

Поиск заказов по номеру или пользователю.

```typescript
const results = await orderService.search('user@email.com')
const results = await orderService.search('123') // по ID заказа
```

---

## Types

```typescript
type OrderStatus =
	| 'PENDING'
	| 'PROCESSING'
	| 'SHIPPED'
	| 'DELIVERED'
	| 'CANCELED'

interface Order {
	id: number
	userId: number
	user: User
	totalPrice: Decimal
	status: OrderStatus
	createdAt: DateTime
	updatedAt: DateTime
	addressId?: number
	deliveryCity: string
	deliveryStreet: string
	items: OrderItem[]
	promocodeId?: number
	promocode?: Promocode
	paymentMethodId?: number
	paymentMethod?: PaymentMethod
}

interface OrderItem {
	id: number
	orderId: number
	productId: number
	quantity: number
	priceAtPurchase: Decimal
	product: Product
}
```

---

## Примеры использования

### Получить и отобразить все заказы

```typescript
import { orderService } from '@/services/orders.service'

export default async function OrdersPage() {
  const orders = await orderService.getAll()

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <h3>Заказ #{order.id}</h3>
          <p>Статус: {order.status}</p>
          <p>Сумма: {order.totalPrice} BYN</p>
        </div>
      ))}
    </div>
  )
}
```

### Создать заказ из диалога

```typescript
'use client'

import { createOrderAction } from '@/server-actions/orders.action'
import { CreateOrderButton } from '@/components/CreateOrderButton'

export default function CheckoutForm({ userId, addresses, paymentMethods }) {
  return (
    <CreateOrderButton
      userId={userId}
      cartTotal={150}
      addresses={addresses}
      paymentMethods={paymentMethods}
    />
  )
}
```

### Изменить статус заказа

```typescript
import { UpdateOrderStatusButton } from '@/components/UpdateOrderStatusButton'

export function OrderRow({ order }) {
  return (
    <tr>
      <td>Заказ #{order.id}</td>
      <td>
        <UpdateOrderStatusButton
          orderId={order.id}
          currentStatus={order.status}
        />
      </td>
    </tr>
  )
}
```

---

## Database Queries

Все запросы используют Prisma ORM и встроенные триггеры БД для:

- Проверки валидности промокодов
- Автоматического пересчета сумм
- Обновления статистики пользователей
- Скрытия товаров при отсутствии в наличии
