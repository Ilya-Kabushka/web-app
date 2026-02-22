// src/store/use-cart-store.ts
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface CartItem {
	productId: number
	quantity: number
}

interface CartStore {
	items: CartItem[]
	addItem: (productId: number) => void
	removeItem: (productId: number) => void
	updateQuantity: (productId: number, quantity: number) => void
	clearCart: () => void
	getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],

			addItem: productId =>
				set(state => {
					const existing = state.items.find(
						item => item.productId === productId,
					)
					if (existing) {
						return {
							items: state.items.map(item =>
								item.productId === productId
									? { ...item, quantity: item.quantity + 1 }
									: item,
							),
						}
					}
					return { items: [...state.items, { productId, quantity: 1 }] }
				}),

			removeItem: productId =>
				set(state => ({
					items: state.items.filter(item => item.productId !== productId),
				})),

			updateQuantity: (productId, quantity) =>
				set(state => ({
					items: state.items.map(item =>
						item.productId === productId ? { ...item, quantity } : item,
					),
				})),

			clearCart: () => set({ items: [] }),

			getTotalItems: () =>
				get().items.reduce((sum, item) => sum + item.quantity, 0),
		}),
		{
			name: 'cart-storage',
			storage: createJSONStorage(() => localStorage),
		},
	),
)
