import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Key is id + size so same product in different sizes = separate cart items
const itemKey = (productId, size) => `${productId}_${size || 'one-size'}`

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      addItem: (product, quantity = 1) => {
        const key = itemKey(product.id, product.selectedSize)
        const existing = get().cartItems.find(item => item.cartKey === key)

        if (existing) {
          set({
            cartItems: get().cartItems.map(item =>
              item.cartKey === key
                ? { ...item, quantity: Math.min(item.stock_quantity, item.quantity + quantity) }
                : item
            )
          })
        } else {
          set({
            cartItems: [
              ...get().cartItems,
              {
                cartKey: key,
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                category: product.category,
                stock_quantity: product.stock_quantity,
                selectedSize: product.selectedSize || null,
                quantity,
              }
            ]
          })
        }
      },

      removeItem: (cartKey) => {
        set({ cartItems: get().cartItems.filter(item => item.cartKey !== cartKey) })
      },

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartKey)
          return
        }
        set({
          cartItems: get().cartItems.map(item =>
            item.cartKey === cartKey ? { ...item, quantity } : item
          )
        })
      },

      clearCart: () => set({ cartItems: [] }),

      getCartCount: () =>
        get().cartItems.reduce((total, item) => total + item.quantity, 0),

      getCartTotal: () =>
        get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0),

      // Check by product id only (not size) — used for "already in cart" indicator
      isInCart: (productId) =>
        get().cartItems.some(item => item.id === productId),

      getItemQuantity: (productId) => {
        const item = get().cartItems.find(item => item.id === productId)
        return item ? item.quantity : 0
      }
    }),
    {
      name: 'mitras-cart-storage',
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
)

export default useCartStore