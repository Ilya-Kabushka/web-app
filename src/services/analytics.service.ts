import { prisma } from '@/lib/prisma'

export const analyticsService = {
	// 1. Топ-5 самых прибыльных категорий товаров
	getTopCategoriesByRevenue: async () => {
		return await prisma.$queryRaw<Array<{ name: string; revenue: string }>>`
			SELECT c.name, CAST(SUM(oi.price_at_purchase * oi.quantity) AS TEXT) as revenue
			FROM categories c
			JOIN products p ON c.id = p.category_id
			JOIN order_items oi ON p.id = oi.product_id
			GROUP BY c.id, c.name
			ORDER BY revenue DESC
			LIMIT 5
		`
	},

	// 2. Пользователи, потратившие больше среднего чека
	getAboveAverageSpenders: async () => {
		return await prisma.$queryRaw<
			Array<{ first_name: string; email: string; total_spent: string }>
		>`
			SELECT u.first_name, u.email, CAST(u.total_spent AS TEXT) as total_spent
			FROM users u
			WHERE u.total_spent > (SELECT AVG(total_price) FROM orders)
			ORDER BY u.total_spent DESC
		`
	},

	// 3. Товары, которые ни разу не заказывали (поиск неликвида)
	getUnorderedProducts: async () => {
		return await prisma.$queryRaw<Array<{ name: string }>>`
			SELECT p.name
			FROM products p
			LEFT JOIN order_items oi ON p.id = oi.product_id
			WHERE oi.id IS NULL
			ORDER BY p.name
		`
	},

	// 4. Средний рейтинг товаров по каждой категории
	getAverageRatingByCategory: async () => {
		return await prisma.$queryRaw<
			Array<{ name: string; avg_cat_rating: string }>
		>`
			SELECT c.name, CAST(ROUND(AVG(p.average_rating), 2) AS TEXT) as avg_cat_rating
			FROM categories c
			JOIN products p ON c.id = p.category_id
			GROUP BY c.id, c.name
			ORDER BY avg_cat_rating DESC
		`
	},

	// 5. Количество заказов по городам
	getOrdersByCity: async () => {
		return await prisma.$queryRaw<
			Array<{ delivery_city: string; order_count: string }>
		>`
			SELECT o.delivery_city, CAST(COUNT(*) AS TEXT) as order_count
			FROM orders o
			GROUP BY o.delivery_city
			ORDER BY order_count DESC
		`
	},

	// 6. Динамика регистраций по месяцам
	getUserRegistrationDynamics: async () => {
		return await prisma.$queryRaw<Array<{ month: Date; new_users: string }>>`
			SELECT 
				DATE_TRUNC('month', created_at) as month, 
				CAST(COUNT(*) AS TEXT) as new_users
			FROM users
			GROUP BY DATE_TRUNC('month', created_at)
			ORDER BY month
		`
	},

	// 7. Список товаров с критически низким остатком (меньше 5 шт суммарно)
	getCriticallyLowStock: async () => {
		return await prisma.$queryRaw<Array<{ name: string; total_qty: string }>>`
			SELECT p.name, CAST(SUM(s.quantity) AS TEXT) as total_qty
			FROM products p
			JOIN stocks s ON p.id = s.product_id
			GROUP BY p.id, p.name
			HAVING SUM(s.quantity) < 5
			ORDER BY total_qty ASC
		`
	},

	// 8. Суммарная стоимость товаров на каждом складе
	getWarehouseValue: async () => {
		return await prisma.$queryRaw<
			Array<{ name: string; warehouse_value: string }>
		>`
			SELECT w.name, CAST(SUM(s.quantity * p.base_price) AS TEXT) as warehouse_value
			FROM warehouses w
			JOIN stocks s ON w.id = s.warehouse_id
			JOIN products p ON s.product_id = p.id
			GROUP BY w.id, w.name
			ORDER BY warehouse_value DESC
		`
	},

	// 9. Выручка в текущем месяце по сравнению с предыдущим (LAG - оконная функция)
	getMonthlyRevenue: async () => {
		return await prisma.$queryRaw<
			Array<{ month: Date; revenue: string; prev_revenue: string | null }>
		>`
			SELECT
				DATE_TRUNC('month', created_at) as month,
				CAST(SUM(total_price) AS TEXT) as revenue,
				CAST(LAG(SUM(total_price)) OVER (ORDER BY DATE_TRUNC('month', created_at)) AS TEXT) as prev_revenue
			FROM orders
			GROUP BY DATE_TRUNC('month', created_at)
			ORDER BY month DESC
			LIMIT 12
		`
	},

	// 10. Топ-3 самых дорогих товара в каждой категории (Оконная функция RANK)
	getTopProductsByCategory: async () => {
		return await prisma.$queryRaw<
			Array<{
				name: string
				price: string
				category_id: string
				category_name: string
			}>
		>`
			SELECT t.name, CAST(t.price AS TEXT), t.category_id, c.name as category_name
			FROM (
				SELECT p.name, p.base_price as price, p.category_id,
					RANK() OVER (PARTITION BY p.category_id ORDER BY p.base_price DESC) as r
				FROM products p
			) t
			JOIN categories c ON t.category_id = c.id
			WHERE t.r <= 3
			ORDER BY t.category_id, t.r
		`
	},

	// 11. Пользователи, оставившие более 3 отзывов
	getActiveReviewers: async () => {
		return await prisma.$queryRaw<
			Array<{ email: string; review_count: string }>
		>`
			SELECT u.email, CAST(COUNT(r.id) AS TEXT) as review_count
			FROM users u
			LEFT JOIN reviews r ON u.id = r.user_id
			GROUP BY u.id, u.email
			HAVING COUNT(r.id) > 3
			ORDER BY review_count DESC
		`
	},

	// 12. Процент использования промокодов в заказах
	getPromoUsagePercent: async () => {
		return await prisma.$queryRaw<Array<{ promo_usage_percent: string }>>`
			SELECT
				CAST(ROUND(COUNT(promocode_id) * 100.0 / COUNT(*), 2) AS TEXT) as promo_usage_percent
			FROM orders
		`
	},

	// 13. Самые популярные способы оплаты у VIP-клиентов (потрачено > 1000)
	getVIPPaymentMethods: async () => {
		return await prisma.$queryRaw<Array<{ type: string; count: string }>>`
			SELECT pm.type, CAST(COUNT(*) AS TEXT) as count
			FROM payment_methods pm
			JOIN orders o ON pm.id = o.payment_method_id
			WHERE o.user_id IN (SELECT id FROM users WHERE total_spent > 1000)
			GROUP BY pm.type
			ORDER BY count DESC
		`
	},

	// 14. Общая статистика сdashboard
	getDashboardStats: async () => {
		const [totalOrders, totalRevenue, totalUsers, totalProducts] =
			await Promise.all([
				prisma.order.count(),
				prisma.$queryRaw<Array<{ total: string }>>`
				SELECT CAST(COALESCE(SUM(total_price), 0) AS TEXT) as total FROM orders
			`,
				prisma.user.count({
					where: { role: 'USER' },
				}),
				prisma.product.count(),
			])

		return {
			totalOrders,
			totalRevenue: totalRevenue[0]?.total || '0',
			totalUsers,
			totalProducts,
		}
	},

	// 15. Заказы за последний месяц по дням
	getOrdersTrendLastMonth: async () => {
		return await prisma.$queryRaw<Array<{ date: Date; count: string }>>`
			SELECT 
				DATE(created_at) as date,
				CAST(COUNT(*) AS TEXT) as count
			FROM orders
			WHERE created_at >= NOW() - INTERVAL '30 days'
			GROUP BY DATE(created_at)
			ORDER BY date ASC
		`
	},

	// 16. Товары с лучшим рейтингом
	getTopRatedProducts: async () => {
		return await prisma.$queryRaw<
			Array<{ name: string; average_rating: string; category_name: string }>
		>`
			SELECT 
				p.name,
				CAST(p.average_rating AS TEXT) as average_rating,
				c.name as category_name
			FROM products p
			JOIN categories c ON p.category_id = c.id
			WHERE p.average_rating > 0
			ORDER BY p.average_rating DESC
			LIMIT 10
		`
	},

	// 17. Статус заказов распределение
	getOrderStatusDistribution: async () => {
		return await prisma.$queryRaw<Array<{ status: string; count: string }>>`
			SELECT 
				status::TEXT,
				CAST(COUNT(*) AS TEXT) as count
			FROM orders
			GROUP BY status
		`
	},

	// 18. Средний размер заказа
	getAverageOrderValue: async () => {
		return await prisma.$queryRaw<Array<{ average_price: string }>>`
			SELECT CAST(ROUND(AVG(total_price)::numeric, 2) AS TEXT) as average_price
			FROM orders
		`
	},
}
