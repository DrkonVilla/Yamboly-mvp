import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { SkeletonCard } from '../components/SkeletonCard';
import { FilterPanel } from '../components/FilterPanel';
import { EmptyState } from '../components/EmptyState';
import { Footer } from '../components/Footer';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex flex-col justify-between font-sans bg-gray-50 text-slate-800">
      <div>
        {/* Modern Corporate Hero Section */}
        <div className="bg-gradient-to-br from-yamboly-purple to-[#3A225E] relative overflow-hidden pt-20 pb-28">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="flex-1 max-w-2xl text-center md:text-left">
              <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/30">
                100% Peruano
              </span>
              <h1 className="font-baloo text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Sabor y diversión <br />
                <span className="text-yamboly-cyanLight">para compartir.</span>
              </h1>
              <p className="text-lg text-white/90 font-medium mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                Descubre nuestra variedad de helados artesanales creados con pasión, tradición y los mejores ingredientes para toda la familia.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <a
                  href="#catalogo"
                  className="w-full sm:w-auto bg-yamboly-cyan hover:bg-yamboly-cyanLight text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-yamboly-cyan/30 flex items-center justify-center gap-2"
                >
                  Ver Catálogo
                </a>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-md relative mt-8 md:mt-0">
              <div className="relative flex justify-center">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl opacity-50 transform scale-110"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-4 border-white/40 transform rotate-2">
                  <img src="/logo.png" alt="Yámboly Helados" className="w-full max-w-[280px] mx-auto" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px] md:h-[60px]">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.3,191.56,104.14,236.44,92.81,279.79,75.4,321.39,56.44Z" className="fill-gray-50"></path>
            </svg>
          </div>
        </div>

        {/* Catalog Section */}
        <div id="catalogo" className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="font-baloo text-4xl font-bold text-slate-800 mb-4">Nuestros Productos</h2>
            <div className="h-1 w-24 bg-yamboly-cyan mx-auto rounded-full"></div>
          </div>

          <div className="flex md:hidden mb-6 gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={filters.search}
                onChange={(e) => updateURL({ ...filters, search: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan text-slate-700"
              />
            </div>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="bg-yamboly-purple text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition-transform"
            >
              Filtros
            </button>
          </div>

          <div className="flex gap-8">
            <aside className="hidden md:block w-72 shrink-0">
              <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100 sticky top-24">
                <div className="mb-6 relative">
                  <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={filters.search}
                    onChange={(e) => updateURL({ ...filters, search: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan focus:border-yamboly-cyan text-slate-700 transition-shadow"
                  />
                </div>
                <div className="h-[1px] w-full bg-slate-100 mb-6"></div>
                <FilterPanel
                  categorias={categories}
                  filters={filters}
                  onFilterChange={updateURL}
                />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {hasActiveFilters && (
                <div className="flex flex-col gap-3 mb-6 bg-white p-4 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Filtros aplicados</span>
                    <button onClick={clearFilters} className="text-xs text-yamboly-cyan font-semibold hover:text-yamboly-cyanLight transition-colors">
                      Limpiar todos
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.categoria_ids.map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return (
                        <span key={`cat-${id}`} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                          {cat?.nombre || id} <button onClick={() => removeFilter('categoria_ids', id)} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                        </span>
                      );
                    })}
                    {filters.minPrice > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                        Desde S/{filters.minPrice} <button onClick={() => removeFilter('minPrice')} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    )}
                    {filters.maxPrice < 50 && (
                      <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                        Hasta S/{filters.maxPrice} <button onClick={() => removeFilter('maxPrice')} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    )}
                    {filters.inStock && (
                      <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                        En stock <button onClick={() => removeFilter('inStock')} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    )}
                    {filters.sabores.map((s) => (
                      <span key={`sabor-${s}`} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                        {s} <button onClick={() => removeFilter('sabores', s)} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    ))}
                    {filters.search && (
                      <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium">
                        "{filters.search}" <button onClick={() => removeFilter('search')} className="text-slate-400 hover:text-red-500 transition-colors">&times;</button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <p className="text-sm font-medium text-slate-500">
                  Mostrando <span className="text-slate-800 font-bold">{sortedProducts.length}</span> resultados
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-500">Ordenar por:</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateURL({ ...filters, sort: e.target.value })}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yamboly-cyan text-slate-700 cursor-pointer shadow-sm"
                  >
                    <option value="created_at_desc">Novedades</option>
                    <option value="precio_venta_asc">Menor precio</option>
                    <option value="precio_venta_desc">Mayor precio</option>
                    <option value="nombre_asc">Nombre A-Z</option>
                  </select>
                </div>
              </div>

              {sortedProducts.length === 0 ? (
                <EmptyState title="No se encontraron productos" message="Intenta ajustar tus filtros o realizar una búsqueda distinta." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => {
                    const hasOffer = !!product.precio_oferta;
                    const activePrice = hasOffer ? product.precio_oferta : product.precio_venta;
                    const regularPrice = hasOffer ? product.precio_venta : null;
                    const safePrice = (val) => (val ?? 0).toFixed(2);
                    const inWishlist = isInWishlist(product.id);
                    const isNew = product.id % 5 === 0; // Simulated 'new' flag

                    return (
                      <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                        <div className="relative p-4">
                          {hasOffer && (
                            <span className="absolute top-4 left-4 z-10 bg-yamboly-magenta text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                              Oferta
                            </span>
                          )}
                          {!hasOffer && isNew && (
                            <span className="absolute top-4 left-4 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                              Nuevo
                            </span>
                          )}
                          
                          <button
                            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                          >
                            <span className={`text-sm ${inWishlist ? 'text-red-500' : 'text-slate-300'}`}>{inWishlist ? '❤️' : '🤍'}</span>
                          </button>

                          <Link to={`/product/${product.id}`} className="block relative h-56 rounded-xl bg-slate-50 overflow-hidden mix-blend-multiply flex items-center justify-center p-4">
                            <img
                              src={product.imagen_url || `https://picsum.photos/seed/${product.sku}/400/400`}
                              alt={product.nombre}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                          </Link>
                        </div>

                        <div className="p-5 flex-1 flex flex-col border-t border-slate-50">
                          <Link to={`/product/${product.id}`} className="block mb-1">
                            <h3 className="font-baloo text-lg font-bold text-slate-800 group-hover:text-yamboly-cyan transition-colors line-clamp-2 leading-tight">
                              {product.nombre}
                            </h3>
                          </Link>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
                            {product.descripcion_corta}
                          </p>
                          
                          <div className="mt-auto flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-slate-800">
                                  <span className="text-sm text-slate-400 font-medium mr-0.5">S/</span>{safePrice(activePrice)}
                                </span>
                              </div>
                              {regularPrice != null && (
                                <span className="text-xs text-slate-400 line-through">S/ {safePrice(regularPrice)}</span>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm ${
                                product.stock === 0
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-yamboly-cyan hover:bg-yamboly-cyanLight text-white active:scale-95 hover:shadow-md hover:shadow-yamboly-cyan/20'
                              }`}
                              title={product.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
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
    </div>
  );
};
