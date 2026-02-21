'use server'

import { analyticsService } from '@/services/analytics.service'

// Получить топ категории по выручке
export async function getTopCategoriesByRevenueAction() {
	try {
		return await analyticsService.getTopCategoriesByRevenue()
	} catch (error) {
		console.error('Error getting top categories:', error)
		throw error
	}
}

// Получить пользователей выше среднего
export async function getAboveAverageSpendersAction() {
	try {
		return await analyticsService.getAboveAverageSpenders()
	} catch (error) {
		console.error('Error getting above average spenders:', error)
		throw error
	}
}

// Получить неказанные товары
export async function getUnorderedProductsAction() {
	try {
		return await analyticsService.getUnorderedProducts()
	} catch (error) {
		console.error('Error getting unordered products:', error)
		throw error
	}
}

// Получить средний рейтинг по категориям
export async function getAverageRatingByCategoryAction() {
	try {
		return await analyticsService.getAverageRatingByCategory()
	} catch (error) {
		console.error('Error getting average rating by category:', error)
		throw error
	}
}

// Получить заказы по городам
export async function getOrdersByCityAction() {
	try {
		return await analyticsService.getOrdersByCity()
	} catch (error) {
		console.error('Error getting orders by city:', error)
		throw error
	}
}

// Получить динамику регистраций
export async function getUserRegistrationDynamicsAction() {
	try {
		return await analyticsService.getUserRegistrationDynamics()
	} catch (error) {
		console.error('Error getting user registration dynamics:', error)
		throw error
	}
}

// Получить критический остаток
export async function getCriticallyLowStockAction() {
	try {
		return await analyticsService.getCriticallyLowStock()
	} catch (error) {
		console.error('Error getting critically low stock:', error)
		throw error
	}
}

// Получить стоимость на складах
export async function getWarehouseValueAction() {
	try {
		return await analyticsService.getWarehouseValue()
	} catch (error) {
		console.error('Error getting warehouse value:', error)
		throw error
	}
}

// Получить месячную выручку
export async function getMonthlyRevenueAction() {
	try {
		return await analyticsService.getMonthlyRevenue()
	} catch (error) {
		console.error('Error getting monthly revenue:', error)
		throw error
	}
}

// Получить топ товары по категориям
export async function getTopProductsByCategoryAction() {
	try {
		return await analyticsService.getTopProductsByCategory()
	} catch (error) {
		console.error('Error getting top products by category:', error)
		throw error
	}
}

// Получить активных рецензентов
export async function getActiveReviewersAction() {
	try {
		return await analyticsService.getActiveReviewers()
	} catch (error) {
		console.error('Error getting active reviewers:', error)
		throw error
	}
}

// Получить процент использования промокодов
export async function getPromoUsagePercentAction() {
	try {
		return await analyticsService.getPromoUsagePercent()
	} catch (error) {
		console.error('Error getting promo usage percent:', error)
		throw error
	}
}

// Получить способы оплаты VIP
export async function getVIPPaymentMethodsAction() {
	try {
		return await analyticsService.getVIPPaymentMethods()
	} catch (error) {
		console.error('Error getting VIP payment methods:', error)
		throw error
	}
}

// Получить статистику дашборда
export async function getDashboardStatsAction() {
	try {
		return await analyticsService.getDashboardStats()
	} catch (error) {
		console.error('Error getting dashboard stats:', error)
		throw error
	}
}

// Получить тренд заказов за месяц
export async function getOrdersTrendLastMonthAction() {
	try {
		return await analyticsService.getOrdersTrendLastMonth()
	} catch (error) {
		console.error('Error getting orders trend:', error)
		throw error
	}
}

// Получить товары с лучшим рейтингом
export async function getTopRatedProductsAction() {
	try {
		return await analyticsService.getTopRatedProducts()
	} catch (error) {
		console.error('Error getting top rated products:', error)
		throw error
	}
}

// Получить распределение статусов заказов
export async function getOrderStatusDistributionAction() {
	try {
		return await analyticsService.getOrderStatusDistribution()
	} catch (error) {
		console.error('Error getting order status distribution:', error)
		throw error
	}
}

// Получить средний размер заказа
export async function getAverageOrderValueAction() {
	try {
		return await analyticsService.getAverageOrderValue()
	} catch (error) {
		console.error('Error getting average order value:', error)
		throw error
	}
}
