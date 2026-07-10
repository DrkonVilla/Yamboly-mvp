import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useCartStore } from '../stores/cartStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { WaveDivider } from '../components/WaveDivider';
import { Footer } from '../components/Footer';
import toast from 'react-hot-toast';

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=50'),
          api.get('/categories'),
        ]);
        if (prodRes.data.success) setProducts(prodRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory ? p.categoria_id === parseInt(selectedCategory) : true;
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.descripcion_corta.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }
    addItem(product, 1);
    toast.success(`Agregado: ${product.nombre}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Banner Hero */}
        <div className="relative bg-gradient-to-r from-yamboly-cyan to-yamboly-cyanLight pt-16 pb-24 text-white overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            {/* Texto Hero */}
            <div className="flex-1 text-center md:text-left max-w-xl">
              <span className="bg-yamboly-yellow text-yamboly-purple text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                🍦 Campaña de Verano Yámboly
              </span>
              <h1 className="font-baloo text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wide mt-4 mb-4 drop-shadow-md text-yamboly-purple leading-tight">
                ¡Sabor y diversión para todo el Perú!
              </h1>
              <p className="text-sm md:text-base text-yamboly-purple font-medium opacity-90 mb-6 max-w-lg">
                Helados 100% peruanos hechos para compartir los mejores momentos en familia. Explora nuestra variedad de paletas, potes familiares y ediciones especiales.
              </p>
              <a
                href="#catalogo"
                className="inline-block bg-yamboly-magenta text-white font-bold px-6 py-3 rounded-full shadow hover:bg-yamboly-magenta/90 transform hover:scale-105 transition-all text-sm"
              >
                Ver Catálogo
              </a>
            </div>

            {/* Ilustración Hero (Mockup / Logo) */}
            <div className="flex-1 flex justify-center relative">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm p-6 shadow-inner animate-pulse">
                <img
                  src="/logo.png"
                  alt="Yámboly Presentación"
                  className="w-auto h-40 md:h-52 drop-shadow-xl select-none"
                />
              </div>
            </div>
          </div>

          {/* Divisor de olas SVG */}
          <WaveDivider fill="fill-[#FAF9F6]" className="absolute bottom-0 left-0 w-full" />
        </div>

        {/* Sección del catálogo */}
        <div id="catalogo" className="container mx-auto px-4 py-8">
          {/* Título de la tienda */}
          <div className="text-center mb-8">
            <h2 className="font-baloo text-3xl font-bold text-yamboly-purple">Explora Nuestro Catálogo</h2>
            <p className="text-sm text-yamboly-purpleLight mt-1">Frescura y calidad directamente a tu mesa</p>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-6 mb-10 max-w-4xl mx-auto items-center">
            {/* Buscador */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="¿Qué helado se te antoja hoy?..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-yamboly-purpleLight/30 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan bg-white shadow-sm transition-all text-yamboly-purple"
              />
            </div>

            {/* Pills de categoría */}
            <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide border transition-all ${
                  selectedCategory === ''
                    ? 'bg-yamboly-magenta text-white border-transparent shadow'
                    : 'bg-white border-yamboly-purple/30 text-yamboly-purple hover:bg-yamboly-cyanLight/10'
                }`}
              >
                Todos
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id.toString())}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide border transition-all ${
                    selectedCategory === c.id.toString()
                      ? 'bg-yamboly-magenta text-white border-transparent shadow'
                      : 'bg-white border-yamboly-purple/30 text-yamboly-purple hover:bg-yamboly-cyanLight/10'
                  }`}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de productos */}
          {filteredProducts.length === 0 ? (
            <EmptyState title="No hay helados disponibles" message="Prueba con otra búsqueda o categoría" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const hasOffer = !!product.precio_oferta;
                const activePrice = hasOffer ? product.precio_oferta : product.precio_venta;
                const regularPrice = hasOffer ? product.precio_venta : null;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      <Link to={`/product/${product.id}`} className="relative block overflow-hidden bg-gray-50">
                        {hasOffer && (
                          <span className="absolute top-2 left-2 bg-yamboly-magenta text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase z-10 shadow-sm animate-bounce">
                            Oferta
                          </span>
                        )}
                        <img
                          src={product.imagen_url || `https://picsum.photos/seed/${product.sku}/300/300`}
                          alt={product.nombre}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <div className="p-4">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-baloo text-lg font-bold text-yamboly-purple hover:text-yamboly-magenta truncate transition-colors">
                            {product.nombre}
                          </h3>
                        </Link>
                        <p className="text-xs text-yamboly-purpleLight truncate mb-3">{product.descripcion_corta}</p>
                        
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-extrabold text-yamboly-purple">
                            S/ {activePrice.toFixed(2)}
                          </span>
                          {regularPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              S/ {regularPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">* Precios incluyen IGV</p>
                      </div>
                    </div>
                    
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all transform active:scale-95 ${
                          product.stock === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-yamboly-magenta text-white hover:bg-yamboly-magenta/90 hover:shadow-md'
                        }`}
                      >
                        {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};