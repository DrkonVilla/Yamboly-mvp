import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { SkeletonCard } from '../components/SkeletonCard';
import { FilterPanel } from '../components/FilterPanel';
import { EmptyState } from '../components/EmptyState';
import { WaveDivider } from '../components/WaveDivider';
import { Footer } from '../components/Footer';
import toast from 'react-hot-toast';

const CountUp = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const endVal = parseInt(end, 10);
    if (isNaN(endVal)) return;
    if (start === endVal) return;

    const totalMiliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / endVal), 20);

    const timer = setInterval(() => {
      start += Math.ceil(endVal / (totalMiliseconds / incrementTime));
      if (start >= endVal) {
        clearInterval(timer);
        setCount(endVal);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{prefix}{count}{suffix}</span>;
};

const SORT_MAP = {
  created_at_desc: { sort: 'created_at', order: 'desc' },
  precio_venta_asc: { sort: 'precio_venta', order: 'asc' },
  precio_venta_desc: { sort: 'precio_venta', order: 'desc' },
  nombre_asc: { sort: 'nombre', order: 'asc' },
};

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const filtersFromParams = useCallback(() => ({
    categoria_ids: searchParams.get('categoria_ids')?.split(',').map(Number).filter(Boolean) || [],
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 50,
    inStock: searchParams.get('inStock') === 'true',
    sabores: searchParams.get('sabores')?.split(',').filter(Boolean) || [],
    sort: searchParams.get('sort') || 'created_at_desc',
    search: searchParams.get('search') || '',
  }), [searchParams]);

  const [filters, setFilters] = useState(filtersFromParams);

  useEffect(() => {
    setFilters(filtersFromParams());
  }, [filtersFromParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products', { params: { limit: 50 } }),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (prodRes.data.success) setProducts(prodRes.data.data);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateURL = (newFilters) => {
    const params = {};
    if (newFilters.categoria_ids?.length) params.categoria_ids = newFilters.categoria_ids.join(',');
    if (newFilters.minPrice > 0) params.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice < 50) params.maxPrice = newFilters.maxPrice;
    if (newFilters.inStock) params.inStock = 'true';
    if (newFilters.sabores?.length) params.sabores = newFilters.sabores.join(',');
    if (newFilters.sort && newFilters.sort !== 'created_at_desc') params.sort = newFilters.sort;
    if (newFilters.search) params.search = newFilters.search;
    setSearchParams(params, { replace: true });
    setFilters(newFilters);
  };

  const filteredProducts = products.filter((p) => {
    if (filters.categoria_ids.length && !filters.categoria_ids.includes(p.categoria_id)) return false;
    if (filters.minPrice > 0 && p.precio_venta < filters.minPrice) return false;
    if (filters.maxPrice < 50 && p.precio_venta > filters.maxPrice) return false;
    if (filters.inStock && p.stock <= 0) return false;
    if (filters.sabores.length) {
      const hasSabor = filters.sabores.some((s) =>
        p.descripcion_corta.toLowerCase().includes(s.toLowerCase())
      );
      if (!hasSabor) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.nombre.toLowerCase().includes(q) && !p.descripcion_corta.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const s = SORT_MAP[filters.sort] || SORT_MAP.created_at_desc;
    if (s.sort === 'precio_venta') {
      const pa = a.precio_oferta || a.precio_venta;
      const pb = b.precio_oferta || b.precio_venta;
      return s.order === 'asc' ? pa - pb : pb - pa;
    }
    if (s.sort === 'nombre') {
      return s.order === 'asc' ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre);
    }
    return 0;
  });

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }
    addItem(product, 1);
    toast.success(`Agregado: ${product.nombre}`);
  };

  const hasActiveFilters = filters.categoria_ids.length > 0 || filters.minPrice > 0 || filters.maxPrice < 50 || filters.inStock || filters.sabores.length > 0 || filters.search;

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
    setFilters({ categoria_ids: [], minPrice: 0, maxPrice: 50, inStock: false, sabores: [], sort: 'created_at_desc', search: '' });
  };

  const removeFilter = (key, value) => {
    const next = { ...filters };
    if (key === 'categoria_ids') next.categoria_ids = next.categoria_ids.filter((id) => id !== value);
    else if (key === 'sabores') next.sabores = next.sabores.filter((s) => s !== value);
    else if (key === 'minPrice') next.minPrice = 0;
    else if (key === 'maxPrice') next.maxPrice = 50;
    else if (key === 'inStock') next.inStock = false;
    else if (key === 'search') next.search = '';
    updateURL(next);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans">
      <div>
        {/* Premium Banner Section */}
        <div className="relative pt-20 pb-32 overflow-hidden bg-white">
          <div className="absolute inset-0 z-0">
            {/* Animated modern background gradient */}
            <div className="absolute top-0 -left-1/4 w-3/4 h-full bg-gradient-to-br from-yamboly-cyan/20 to-transparent rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob"></div>
            <div className="absolute top-0 -right-1/4 w-3/4 h-full bg-gradient-to-bl from-yamboly-magenta/20 to-transparent rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/4 w-1/2 h-1/2 bg-gradient-to-t from-yamboly-yellow/20 to-transparent rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="flex-1 text-center md:text-left max-w-xl xl:max-w-2xl">
              <span className="inline-flex items-center bg-white/60 backdrop-blur-md border border-white/80 text-yamboly-magenta text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-6">
                <span className="w-2 h-2 rounded-full bg-yamboly-magenta animate-pulse mr-2"></span>
                Novedades de Verano
              </span>
              <h1 className="font-baloo text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mt-2 mb-6 text-slate-800 leading-[1.1]">
                Sabor premium que <span className="text-transparent bg-clip-text bg-gradient-to-r from-yamboly-magenta to-yamboly-cyan drop-shadow-sm">enamora al Perú</span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 font-medium mb-8 max-w-lg leading-relaxed">
                Descubre nuestra selección de helados artesanales elaborados con los mejores ingredientes, directamente a tu hogar.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <a
                  href="#catalogo"
                  className="w-full sm:w-auto bg-yamboly-magenta text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:bg-yamboly-magenta/90 transform hover:-translate-y-1 transition-all duration-300 text-sm tracking-wide"
                >
                  Ver Catálogo Completo
                </a>
                <a
                  href="/nosotros"
                  className="w-full sm:w-auto bg-white text-slate-800 font-bold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg border border-slate-100 hover:border-slate-200 transform hover:-translate-y-1 transition-all duration-300 text-sm tracking-wide"
                >
                  Conoce nuestra historia
                </a>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center relative w-full">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Decorative Elements around main image */}
                <div className="absolute inset-0 bg-gradient-to-br from-yamboly-cyan/10 to-yamboly-magenta/10 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-4 bg-white/40 backdrop-blur-xl rounded-full shadow-2xl border border-white/50"></div>
                
                {/* Floating Badges */}
                <div className="absolute -left-6 top-1/4 bg-white p-3 rounded-2xl shadow-xl border border-white/60 animate-bounce-slow" style={{animationDelay: '0s'}}>
                  <span className="text-2xl">🍦</span>
                </div>
                <div className="absolute -right-4 top-1/3 bg-white p-3 rounded-2xl shadow-xl border border-white/60 animate-bounce-slow" style={{animationDelay: '1s'}}>
                  <span className="text-2xl">🍓</span>
                </div>
                <div className="absolute left-1/4 -bottom-6 bg-white p-3 rounded-2xl shadow-xl border border-white/60 animate-bounce-slow" style={{animationDelay: '2s'}}>
                  <span className="text-2xl">🍫</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center p-8 transform hover:scale-105 transition-transform duration-500">
                  <img src="/logo.png" alt="Yámboly Premium" className="w-auto h-48 md:h-64 drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] select-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Section */}
        <div className="bg-slate-50 relative z-20 pt-8 pb-16">
          <div className="container mx-auto px-4 -mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
              {[
                { count: 500, label: 'Pedidos Entregados', suffix: '+', color: 'from-blue-500 to-cyan-400', icon: '🚚' },
                { count: 7, label: 'Ciudades Cobertura', suffix: '', color: 'from-yamboly-magenta to-pink-400', icon: '🗺️' },
                { count: 20, label: 'Sabores Únicos', suffix: '+', color: 'from-orange-400 to-yamboly-yellow', icon: '✨' },
                { count: 15, label: 'Años de Calidad', suffix: ' años', color: 'from-purple-500 to-indigo-400', icon: '🏆' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                  <div className="text-3xl mb-3 opacity-80 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                  <p className={`text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>
                    <CountUp end={stat.count} suffix={stat.suffix} />
                  </p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-3">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Section */}
        <div id="catalogo" className="container mx-auto px-4 py-16">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="font-baloo text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">Nuestra Colección</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-yamboly-cyan to-yamboly-magenta rounded-full mx-auto mb-6"></div>
            <p className="text-slate-500">Selecciona entre nuestra variedad de postres helados, elaborados con pasión para brindar la mejor experiencia en cada bocado.</p>
          </div>

          <div className="flex md:hidden mb-6 gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Encuentra tu sabor favorito..."
                value={filters.search}
                onChange={(e) => updateURL({ ...filters, search: e.target.value })}
                className="w-full bg-slate-50 border-0 shadow-inner rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan text-slate-700"
              />
            </div>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="bg-slate-800 text-white px-5 py-3 rounded-full text-sm font-bold shadow-md"
            >
              Filtros
            </button>
          </div>

          <div className="flex gap-8">
            <aside className="hidden md:block w-72 shrink-0">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
                <div className="mb-6 relative">
                  <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar helados..."
                    value={filters.search}
                    onChange={(e) => updateURL({ ...filters, search: e.target.value })}
                    className="w-full bg-slate-50 border-0 shadow-inner rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan text-slate-700 placeholder-slate-400"
                  />
                </div>
                <div className="h-px w-full bg-slate-100 mb-6"></div>
                <FilterPanel
                  categorias={categories}
                  filters={filters}
                  onFilterChange={updateURL}
                />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {hasActiveFilters && (
                <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 font-medium">Filtros aplicados:</span>
                    <button onClick={clearFilters} className="text-xs text-yamboly-magenta font-bold hover:text-yamboly-magenta/80 transition-colors">
                      Limpiar todos
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.categoria_ids.map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return (
                        <span key={`cat-${id}`} className="inline-flex items-center gap-1.5 bg-white shadow-sm border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium">
                          {cat?.nombre || id} <button onClick={() => removeFilter('categoria_ids', id)} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                        </span>
                      );
                    })}
                    {filters.minPrice > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-white shadow-sm border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium">
                        Desde S/{filters.minPrice} <button onClick={() => removeFilter('minPrice')} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    )}
                    {filters.maxPrice < 50 && (
                      <span className="inline-flex items-center gap-1.5 bg-white shadow-sm border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium">
                        Hasta S/{filters.maxPrice} <button onClick={() => removeFilter('maxPrice')} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    )}
                    {filters.inStock && (
                      <span className="inline-flex items-center gap-1.5 bg-white shadow-sm border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium">
                        En stock <button onClick={() => removeFilter('inStock')} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    )}
                    {filters.sabores.map((s) => (
                      <span key={`sabor-${s}`} className="inline-flex items-center gap-1.5 bg-white shadow-sm border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium">
                        {s} <button onClick={() => removeFilter('sabores', s)} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    ))}
                    {filters.search && (
                      <span className="inline-flex items-center gap-1.5 bg-white shadow-sm border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium">
                        "{filters.search}" <button onClick={() => removeFilter('search')} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <p className="text-sm text-slate-500 font-medium">
                  Mostrando <strong className="text-slate-800">{sortedProducts.length}</strong> productos
                </p>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-500 font-medium">Ordenar por:</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateURL({ ...filters, sort: e.target.value })}
                    className="bg-white border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan text-slate-700 shadow-sm font-medium cursor-pointer"
                  >
                    <option value="created_at_desc">Novedades</option>
                    <option value="precio_venta_asc">Precio: Menor a Mayor</option>
                    <option value="precio_venta_desc">Precio: Mayor a Menor</option>
                    <option value="nombre_asc">Nombre: A - Z</option>
                  </select>
                </div>
              </div>

              {sortedProducts.length === 0 ? (
                <EmptyState title="No encontramos lo que buscas" message="Intenta ajustar tus filtros o realiza una nueva búsqueda." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedProducts.map((product) => {
                    const hasOffer = !!product.precio_oferta;
                    const activePrice = hasOffer ? product.precio_oferta : product.precio_venta;
                    const regularPrice = hasOffer ? product.precio_venta : null;
                    const safePrice = (val) => (val ?? 0).toFixed(2);
                    const inWishlist = isInWishlist(product.id);
                    const badge = hasOffer ? 'Descuento Especial' : product.id % 7 === 0 ? 'Los Favoritos' : product.id % 11 === 0 ? 'Lanzamiento' : null;

                    return (
                      <div key={product.id} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col group overflow-visible relative">
                        {/* Interactive Image Container */}
                        <div className="relative pt-4 px-4 pb-0 z-10">
                          {badge && (
                            <div className="absolute top-6 left-6 z-20">
                              <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md ${
                                badge === 'Descuento Especial' ? 'bg-yamboly-magenta/90 text-white' :
                                badge === 'Los Favoritos' ? 'bg-yamboly-yellow/90 text-yamboly-purple' :
                                'bg-yamboly-cyan/90 text-white'
                              }`}>
                                {badge}
                              </span>
                            </div>
                          )}
                          
                          <button
                            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                            className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:shadow-md hover:scale-110 transition-all duration-300"
                          >
                            <span className={`text-lg ${inWishlist ? 'text-red-500 scale-110' : 'text-slate-300'} transition-transform`}>{inWishlist ? '❤️' : '🤍'}</span>
                          </button>

                          <Link to={`/product/${product.id}`} className="block relative h-56 rounded-[1.5rem] bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden">
                            {/* Inner soft glow */}
                            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors z-10"></div>
                            <img
                              src={product.imagen_url || `https://picsum.photos/seed/${product.sku}/400/400`}
                              alt={product.nombre}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                            />
                          </Link>
                        </div>

                        {/* Content Container */}
                        <div className="p-6 flex-1 flex flex-col pt-5">
                          <Link to={`/product/${product.id}`} className="block mb-2">
                            <h3 className="font-baloo text-xl font-bold text-slate-800 group-hover:text-yamboly-magenta transition-colors line-clamp-1">
                              {product.nombre}
                            </h3>
                          </Link>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                            {product.descripcion_corta}
                          </p>
                          
                          <div className="mt-auto">
                            <div className="flex items-end gap-3 mb-5">
                              <span className="text-2xl font-extrabold text-slate-800 leading-none">
                                <span className="text-sm text-slate-400 mr-1 font-semibold">S/</span>{safePrice(activePrice)}
                              </span>
                              {regularPrice != null && (
                                <span className="text-sm text-slate-400 line-through font-medium mb-0.5">S/ {safePrice(regularPrice)}</span>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className={`relative w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide overflow-hidden transition-all duration-300 group/btn ${
                                product.stock === 0
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-slate-800 text-white hover:shadow-lg hover:shadow-slate-800/20 hover:-translate-y-0.5 active:translate-y-0'
                              }`}
                            >
                              {product.stock === 0 ? (
                                'Agotado temporalmente'
                              ) : (
                                <>
                                  <span className="relative z-10 flex items-center justify-center gap-2">
                                    <span>Agregar al carrito</span>
                                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                  </span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-yamboly-magenta to-yamboly-cyan opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 z-0"></div>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileFilterOpen && (
        <FilterPanel
          categorias={categories}
          filters={filters}
          onFilterChange={updateURL}
          isMobile
          onClose={() => setMobileFilterOpen(false)}
        />
      )}

      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}} />
    </div>
  );
};
