import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  category?: string;
  image?: string;
  originalProductId?: string;
  variationName?: string;
}

interface CartStore {
  items: CartItem[];
  subtotal: number;
  tax: number;
  taxType: 'percentage' | 'fixed';
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  addItem: (product: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setTax: (tax: number) => void;
  setTaxType: (type: 'percentage' | 'fixed') => void;
  setDiscount: (discount: number) => void;
  setDiscountType: (type: 'percentage' | 'fixed') => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

export const useCartStore = create<CartStore>()(persist(
  (set, get) => ({
    items: [],
    subtotal: 0,
    tax: 0,
    taxType: 'percentage',
    discount: 0,
    discountType: 'percentage',
    total: 0,
    
    addItem: (product) => {
      const { items } = get();
      const existingItem = items.find(item => item._id === product._id);
      
      if (existingItem) {
        set({
          items: items.map(item =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        });
      } else {
        set({
          items: [...items, { ...product, quantity: 1 }]
        });
      }
      get().calculateTotal();
    },
    
    removeItem: (id) => {
      set({
        items: get().items.filter(item => item._id !== id)
      });
      get().calculateTotal();
    },
    
    updateQuantity: (id, quantity) => {
      if (quantity <= 0) {
        get().removeItem(id);
        return;
      }
      
      set({
        items: get().items.map(item =>
          item._id === id ? { ...item, quantity } : item
        )
      });
      get().calculateTotal();
    },
    
    setTax: (tax) => {
      set({ tax });
      get().calculateTotal();
    },
    
    setTaxType: (taxType) => {
      set({ taxType });
      get().calculateTotal();
    },
    
    setDiscount: (discount) => {
      set({ discount });
      get().calculateTotal();
    },
    
    setDiscountType: (discountType) => {
      set({ discountType });
      get().calculateTotal();
    },
    
    clearCart: () => {
      set({ items: [], subtotal: 0, total: 0 });
    },
    
    calculateTotal: () => {
      const { items, tax, taxType, discount, discountType } = get();
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = taxType === 'percentage' ? (subtotal * tax) / 100 : tax;
      const discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
      const total = subtotal + taxAmount - discountAmount;
      set({ subtotal, total });
    }
  }),
  {
    name: 'cart-storage'
  }
));