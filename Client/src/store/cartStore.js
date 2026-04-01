import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
    
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

        localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
    },

    setCartQty: (id, qty) => {
        set((state) => ({
            cartItems: state.cartItems.map(x => x.product === id ? { ...x, qty } : x)
        }));
        localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
    },

    removeFromCart: (id) => {
        set((state) => ({
            cartItems: state.cartItems.filter(x => x.product !== id)
        }));
        localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
    },

    clearCart: () => {
        set({ cartItems: [] });
        localStorage.removeItem('cartItems');
    }
}));

export default useCartStore;
