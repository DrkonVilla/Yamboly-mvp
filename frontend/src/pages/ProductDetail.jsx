import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCartStore } from '../stores/cartStore';
import { ImageGallery } from '../components/ImageGallery';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STAR_FULL = '★';
const STAR_EMPTY = '☆';

const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(STAR_FULL);
    else if (i === full && half) stars.push('★');
    else stars.push(STAR_EMPTY);
  }
  return stars.join('');
};

const getBadge = (product) => {
  if (product.precio_oferta) return { text: 'Oferta', class: 'bg-yamboly-magenta text-white' };
  if (product.id % 7 === 0) return { text: 'Más vendido', class: 'bg-yamboly-yellow text-yamboly-purple' };
  if (product.id % 11 === 0) return { text: 'Nuevo', class: 'bg-yamboly-cyan text-white' };
  return null;
};

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
          const relRes = await api.get('/products', {
            params: { categoria_id: res.data.data.categoria_id, limit: 5 },
          });
          if (relRes.data.success) {
            setRelatedProducts(relRes.data.data.filter((p) => p.id !== res.data.data.id).slice(0, 4));
          }
        }
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
  const safePrice = (val) => (val ?? 0).toFixed(2);
  const badge = getBadge(product);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-yamboly-cyan transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-yamboly-purple/60">{product.categoria?.nombre || 'Helado'}</span>
          <span>/</span>
          <span className="text-yamboly-purple font-semibold truncate max-w-[200px]">{product.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div>
            <div className="relative">
              {badge && (
                <span className={`absolute top-2 left-2 z-10 text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm ${badge.class}`}>
                  {badge.text}
                </span>
              )}
              <ImageGallery sku={product.sku} nombre={product.nombre} />
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-yamboly-cyan/15 text-yamboly-purple text-xs font-bold px-3 py-1 rounded-full">
                  {product.categoria?.nombre || 'Helado'}
                </span>
                <span className="text-xs text-yamboly-purpleLight font-medium">SKU: {product.sku}</span>
              </div>

              <h1 className="font-baloo text-3xl font-extrabold text-yamboly-purple mb-2 leading-tight">
                {product.nombre}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-yamboly-yellow text-lg tracking-wider">
                  {renderStars(product.rating || 4.0)}
                </span>
                <span className="text-xs text-yamboly-purpleLight">({(product.rating || 4.0).toFixed(1)})</span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-extrabold text-yamboly-purple">S/ {safePrice(activePrice)}</span>
                {regularPrice != null && (
                  <span className="text-sm text-gray-400 line-through">S/ {safePrice(regularPrice)}</span>
                )}
                <span className="text-xs text-gray-400 font-medium ml-1">(Precio incluye IGV)</span>
              </div>

              {/* ── Comparación de precio vs. mercado ── */}
              <div className="mb-6 mt-1 p-3 bg-cyan-50/60 border border-cyan-100 rounded-xl">
                <p className="text-xs text-yamboly-purple font-semibold mb-2">💰 Comparación de precio</p>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-yamboly-magenta font-bold text-sm">
                    Yámboly: S/ {safePrice(activePrice)}
                  </span>
                  <span className="text-gray-400 line-through text-xs">
                    Marcas premium: S/ {(activePrice * 1.35).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yamboly-magenta h-2 rounded-full transition-all" style={{ width: '65%' }}></div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">Ahorras ~26% comparado con marcas premium del mercado</p>
              </div>


              <p className="text-sm text-yamboly-purpleLight leading-relaxed mb-6">
                {product.descripcion_larga || product.descripcion_corta}
              </p>

              <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100 inline-block">
                <p className="text-xs text-yamboly-purple font-semibold">
                  Disponibilidad:{' '}
                  <span className={product.stock < product.stock_minimo ? 'text-yamboly-magenta font-extrabold' : 'text-emerald-600 font-extrabold'}>
                    {product.stock} unidades
                  </span>
                </p>
                {product.stock < product.stock_minimo && product.stock > 0 && (
                  <p className="text-[10px] text-yamboly-magenta font-bold mt-1">⚠️ ¡Quedan pocas unidades!</p>
                )}
                {product.stock === 0 && (
                  <p className="text-[10px] text-yamboly-magenta font-bold mt-1">❌ Producto agotado</p>
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

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-baloo text-2xl font-bold text-yamboly-purple mb-6">Productos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/product/${rp.id}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                >
                  <img
                    src={rp.imagen_url || `https://picsum.photos/seed/${rp.sku}/200/200`}
                    alt={rp.nombre}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-3">
                    <p className="font-baloo text-sm font-bold text-yamboly-purple truncate">{rp.nombre}</p>
                    <p className="text-xs text-yamboly-purpleLight truncate">{rp.descripcion_corta}</p>
                    <p className="text-sm font-extrabold text-yamboly-purple mt-1">
                      S/ {safePrice(rp.precio_oferta || rp.precio_venta)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
