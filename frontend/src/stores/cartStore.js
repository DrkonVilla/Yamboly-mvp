import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

// Generar guestId si no existe
const getGuestId = () => {
  let id = localStorage.getItem('guestId');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('guestId', id);
  }
  return id;
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      guestId: getGuestId(),

      addItem: (product, quantity = 1, selectedVariant = null) => {
        const { items } = get();
        const existingItem = items.find(
          (item) =>
            item.producto_id === product.id &&
            JSON.stringify(item.variant) === JSON.stringify(selectedVariant)
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item === existingItem
                ? { ...item, cantidad: item.cantidad + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                producto_id: product.id,
                nombre: product.nombre,
                sku: product.sku,
                precio_unitario: product.precio_oferta || product.precio_venta,
                cantidad: quantity,
                imagen_url: product.imagen_url,
                variant: selectedVariant,
                max_stock: product.stock,
              },
            ],
          });
        }
      },

      removeItem: (index) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      updateQuantity: (index, newQuantity) => {
        set((state) => ({
          items: state.items.map((item, i) =>
            i === index
              ? { ...item, cantidad: Math.max(1, Math.min(newQuantity, item.max_stock)) }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.precio_unitario * item.cantidad, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.cantidad, 0);
      },

      getCartItemsForApi: () => {
        const { items } = get();
        return items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        }));
      },
    }),
    {
      name: 'cart-storage', // nombre en localStorage
    }
  )
);