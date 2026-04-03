import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    cartItems: typeof window !== 'undefined' && localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
    appliedCoupon: typeof window !== 'undefined' && localStorage.getItem('appliedCoupon') ? JSON.parse(localStorage.getItem('appliedCoupon')) : null,
    
    setAppliedCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
        if (typeof window !== 'undefined') localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
    },

    addToCart: (product, qty) => {
        const cartItem = {
            product: product._id || product.product,
            name: product.title || product.name,
            image: product.images ? (product.images[0] || '') : (product.image || ''),
            price: product.discountPrice > 0 ? product.discountPrice : product.price,
            qty: qty
        };

        const existingItem = get().cartItems.find(x => x.product === cartItem.product);
        
        if (existingItem) {
            set((state) => ({
                cartItems: state.cartItems.map(x => x.product === existingItem.product 
                    ? { ...cartItem, qty: x.qty + qty } 
                    : x)
            }));
        } else {
            set((state) => ({
                cartItems: [...state.cartItems, cartItem]
            }));
        }

        if (typeof window !== 'undefined') localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
    },

    setCartQty: (id, qty) => {
        set((state) => ({
            cartItems: state.cartItems.map(x => x.product === id ? { ...x, qty } : x)
        }));
        if (typeof window !== 'undefined') localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
    },

    removeFromCart: (id) => {
        set((state) => ({
            cartItems: state.cartItems.filter(x => x.product !== id)
        }));
        if (typeof window !== 'undefined') localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
    },

    clearCart: () => {
        set({ cartItems: [], appliedCoupon: null });
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cartItems');
            localStorage.removeItem('appliedCoupon');
        }
    }
}));

export default useCartStore;
