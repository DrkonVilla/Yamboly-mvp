import { useCartStore } from '../stores/cartStore';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Footer } from '../components/Footer';

const ShippingProgressBar = ({ total }) => {
  const threshold = 50;
  const safe = total ?? 0;
  const remaining = Math.max(0, threshold - safe);
  const percentage = Math.min(100, (safe / threshold) * 100);
  const isFree = safe >= threshold;

  return (
    <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="flex justify-between text-xs mb-2">
        <span className={isFree ? 'text-green-700 font-semibold' : 'text-yamboly-purple/70'}>
          {isFree ? '✅ ¡Estás ahorrando S/ 15.00 en envío!' : `¡Te faltan S/ ${Number.isFinite(remaining) ? remaining.toFixed(2) : '0.00'} para envío gratis!`}
        </span>
        <span className="font-bold text-yamboly-purple">{Number.isNaN(percentage) ? '0' : percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isFree ? 'bg-green-500' : 'bg-yamboly-cyan'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const CartPage = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="w-24 h-24 bg-yamboly-cyanLight/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="font-baloo text-2xl font-bold mb-3 text-yamboly-purple">Tu carrito está vacío</h2>
          <p className="text-sm text-yamboly-purpleLight mb-6">
            ¡Agrega algunos deliciosos helados Yámboly para comenzar a disfrutar!
          </p>
          <Link
            to="/"
            className="inline-block bg-yamboly-magenta text-white font-bold px-6 py-2.5 rounded-full shadow hover:bg-yamboly-magenta/90 transition-all transform active:scale-95"
          >
            Ir a la tienda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="font-baloo text-3xl font-bold mb-6 text-yamboly-purple">Mi Carrito de Compras</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lista de productos */}
          <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-100 py-4 last:border-0">
                <img
                  src={item.imagen_url || `https://picsum.photos/seed/${item.sku}/80/80`}
                  alt={item.nombre}
                  className="w-20 h-20 object-cover rounded-xl shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="font-baloo text-base font-bold text-yamboly-purple">{item.nombre}</h3>
                  <p className="text-xs text-yamboly-purpleLight">SKU: {item.sku}</p>
                  <p className="text-sm font-extrabold text-yamboly-purple mt-1">S/ {((item.precio_unitario ?? 0)).toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <div className="text-right">
                    <p className="text-xs text-yamboly-purpleLight">Subtotal</p>
                    <p className="font-bold text-yamboly-purple">S/ {((item.precio_unitario ?? 0) * item.cantidad).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center border border-yamboly-purpleLight/30 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => updateQuantity(index, Math.max(1, item.cantidad - 1))}
                      className="px-3 py-1 hover:bg-yamboly-cyanLight/10 font-bold transition-all transform active:scale-90 border-r text-yamboly-purple"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 w-10 text-center text-xs font-semibold text-yamboly-purple">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(index, item.cantidad + 1)}
                      className="px-3 py-1 hover:bg-yamboly-cyanLight/10 font-bold transition-all transform active:scale-90 border-l text-yamboly-purple"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(index)}
                    className="text-gray-400 hover:text-yamboly-magenta p-2 rounded-full hover:bg-red-50 transition-colors ml-2"
                    title="Eliminar producto"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between">
              <button
                onClick={clearCart}
                className="text-xs text-yamboly-magenta font-bold hover:text-yamboly-magenta/80 transition-colors"
              >
                Vaciar todo el carrito
              </button>
              <Link to="/" className="text-xs text-yamboly-purple font-bold hover:text-yamboly-magenta transition-colors">
                ← Seguir comprando
              </Link>
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:w-80 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <h3 className="font-baloo text-lg font-bold mb-4 text-yamboly-purple">Resumen del Pedido</h3>

            <ShippingProgressBar total={total} />

            <div className="space-y-3 text-sm border-b pb-4 mb-4">
              <div className="flex justify-between text-yamboly-purple">
                <span>Subtotal</span>
                <span className="font-bold">S/ {(total ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-yamboly-purpleLight">
                <span>Envío</span>
                <span>Calculado en checkout</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-base font-extrabold text-yamboly-purple">
                <span>Total</span>
                <span>S/ {(total ?? 0).toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">* Precios incluyen IGV (18%)</p>
            </div>

            <Link to="/checkout" className="block mt-6">
              <button className="w-full bg-yamboly-magenta text-white py-3 rounded-xl font-bold text-sm shadow hover:bg-yamboly-magenta/90 transition-all transform active:scale-95">
                Proceder al Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};