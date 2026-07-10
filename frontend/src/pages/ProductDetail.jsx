import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCartStore } from '../stores/cartStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) setProduct(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error('Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock < quantity) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }
    addItem(product, quantity);
    toast.success(`Agregado: ${quantity}x ${product.nombre}`);
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-16">Producto no encontrado</div>;

  const hasOffer = !!product.precio_oferta;
  const activePrice = hasOffer ? product.precio_oferta : product.precio_venta;
  const regularPrice = hasOffer ? product.precio_venta : null;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/" className="text-yamboly-purple hover:text-yamboly-magenta font-bold mb-6 inline-block transition-colors">
          ← Volver a la tienda
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          {/* Imagen */}
          <div className="flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden p-4">
            <img
              src={product.imagen_url || `https://picsum.photos/seed/${product.sku}/500/500`}
              alt={product.nombre}
              className="w-full max-h-[350px] object-cover rounded-xl shadow-sm hover:scale-102 transition-transform duration-300"
            />
          </div>

          {/* Detalle */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-yamboly-cyan/15 text-yamboly-purple text-xs font-bold px-3 py-1 rounded-full">
                  {product.categoria?.nombre || 'Helado'}
                </span>
                <span className="text-xs text-yamboly-purpleLight font-medium">
                  SKU: {product.sku}
                </span>
              </div>
              <h1 className="font-baloo text-3xl font-extrabold text-yamboly-purple mb-4 leading-tight">
                {product.nombre}
              </h1>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-extrabold text-yamboly-purple">
                  S/ {activePrice.toFixed(2)}
                </span>
                {regularPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    S/ {regularPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-gray-400 font-medium ml-1"> (Precio incluye IGV)</span>
              </div>

              <p className="text-sm text-yamboly-purpleLight leading-relaxed mb-6">
                {product.descripcion_larga || product.descripcion_corta}
              </p>

              <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100 inline-block">
                <p className="text-xs text-yamboly-purple font-semibold">
                  Disponibilidad: {' '}
                  <span className={product.stock < product.stock_minimo ? 'text-yamboly-magenta font-extrabold' : 'text-emerald-600 font-extrabold'}>
                    {product.stock} unidades
                  </span>
                </p>
                {product.stock < product.stock_minimo && product.stock > 0 && (
                  <p className="text-[10px] text-yamboly-magenta font-bold mt-1">⚠️ ¡Quedan pocas unidades en inventario!</p>
                )}
                {product.stock === 0 && (
                  <p className="text-[10px] text-yamboly-magenta font-bold mt-1">❌ Producto agotado temporalmente</p>
                )}
              </div>
            </div>

            <div>
              {product.stock > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-bold text-yamboly-purple">Cantidad:</label>
                  <div className="flex items-center border border-yamboly-purpleLight/30 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-1.5 hover:bg-yamboly-cyanLight/10 font-bold transition-colors border-r"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 w-12 text-center text-sm font-semibold text-yamboly-purple">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3.5 py-1.5 hover:bg-yamboly-cyanLight/10 font-bold transition-colors border-l"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all transform active:scale-95 ${
                  product.stock === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-yamboly-magenta text-white hover:bg-yamboly-magenta/90 hover:shadow-md'
                }`}
              >
                {product.stock === 0 ? 'Sin stock' : `Agregar al carrito (${quantity})`}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};