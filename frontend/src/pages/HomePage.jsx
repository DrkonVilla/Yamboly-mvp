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
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <div className="relative bg-gradient-to-r from-yamboly-cyan to-yamboly-cyanLight pt-16 pb-24 text-white overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex-1 text-center md:text-left max-w-xl">
              <span className="bg-yamboly-yellow text-yamboly-purple text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                🍦 Campaña de Verano Yámboly
              </span>
              <h1 className="font-baloo text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wide mt-4 mb-4 drop-shadow-md text-yamboly-purple leading-tight">
                ¡Sabor y diversión para todo el Perú!
              </h1>
              <p className="text-sm md:text-base text-yamboly-purple font-medium opacity-90 mb-6 max-w-lg">
                Helados 100% peruanos hechos para compartir los mejores momentos en familia.
              </p>
              <a
                href="#catalogo"
                className="inline-block bg-yamboly-magenta text-white font-bold px-6 py-3 rounded-full shadow hover:bg-yamboly-magenta/90 transform hover:scale-105 transition-all text-sm"
              >
                Ver Catálogo
              </a>
            </div>
            <div className="flex-1 flex justify-center relative">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm p-6 shadow-inner animate-pulse">
                <img src="/logo.png" alt="Yámboly" className="w-auto h-40 md:h-52 drop-shadow-xl select-none" />
              </div>
            </div>
          </div>
          <WaveDivider fill="fill-[#FAF9F6]" className="absolute bottom-0 left-0 w-full" />
        </div>

        <div id="catalogo" className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="font-baloo text-3xl font-bold text-yamboly-purple">Explora Nuestro Catálogo</h2>
            <p className="text-sm text-yamboly-purpleLight mt-1">Frescura y calidad directamente a tu mesa</p>
          </div>

          <div className="flex md:hidden mb-4 gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => updateURL({ ...filters, search: e.target.value })}
                className="w-full border border-yamboly-purpleLight/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan bg-white text-yamboly-purple"
              />
            </div>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="bg-yamboly-cyan text-white px-4 py-2 rounded-xl text-sm font-bold"
            >
              Filtros
            </button>
          </div>

          <div className="flex gap-6">
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={filters.search}
                    onChange={(e) => updateURL({ ...filters, search: e.target.value })}
                    className="w-full border border-yamboly-purpleLight/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan bg-white text-yamboly-purple"
                  />
                </div>
                <FilterPanel
                  categorias={categories}
                  filters={filters}
                  onFilterChange={updateURL}
                />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs text-yamboly-purple/60 font-medium">{sortedProducts.length} productos encontrados</span>
                  <div className="flex flex-wrap gap-1.5">
                    {filters.categoria_ids.map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return (
                        <span key={`cat-${id}`} className="inline-flex items-center gap-1 bg-yamboly-cyan/10 text-yamboly-purple text-xs px-2 py-1 rounded-full">
                          {cat?.nombre || id} <button onClick={() => removeFilter('categoria_ids', id)} className="hover:text-yamboly-magenta font-bold">&times;</button>
                        </span>
                      );
                    })}
                    {filters.minPrice > 0 && (
                      <span className="inline-flex items-center gap-1 bg-yamboly-cyan/10 text-yamboly-purple text-xs px-2 py-1 rounded-full">
                        Desde S/{filters.minPrice} <button onClick={() => removeFilter('minPrice')} className="hover:text-yamboly-magenta font-bold">&times;</button>
                      </span>
                    )}
                    {filters.maxPrice < 50 && (
                      <span className="inline-flex items-center gap-1 bg-yamboly-cyan/10 text-yamboly-purple text-xs px-2 py-1 rounded-full">
                        Hasta S/{filters.maxPrice} <button onClick={() => removeFilter('maxPrice')} className="hover:text-yamboly-magenta font-bold">&times;</button>
                      </span>
                    )}
                    {filters.inStock && (
                      <span className="inline-flex items-center gap-1 bg-yamboly-cyan/10 text-yamboly-purple text-xs px-2 py-1 rounded-full">
                        En stock <button onClick={() => removeFilter('inStock')} className="hover:text-yamboly-magenta font-bold">&times;</button>
                      </span>
                    )}
                    {filters.sabores.map((s) => (
                      <span key={`sabor-${s}`} className="inline-flex items-center gap-1 bg-yamboly-cyan/10 text-yamboly-purple text-xs px-2 py-1 rounded-full">
                        {s} <button onClick={() => removeFilter('sabores', s)} className="hover:text-yamboly-magenta font-bold">&times;</button>
                      </span>
                    ))}
                    {filters.search && (
                      <span className="inline-flex items-center gap-1 bg-yamboly-cyan/10 text-yamboly-purple text-xs px-2 py-1 rounded-full">
                        "{filters.search}" <button onClick={() => removeFilter('search')} className="hover:text-yamboly-magenta font-bold">&times;</button>
                      </span>
                    )}
                  </div>
                  <button onClick={clearFilters} className="text-xs text-yamboly-magenta font-bold hover:underline ml-auto">
                    Limpiar todos
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-yamboly-purple/70 font-medium">
                  {sortedProducts.length} productos encontrados
                </p>
                <select
                  value={filters.sort}
                  onChange={(e) => updateURL({ ...filters, sort: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan text-yamboly-purple bg-white"
                >
                  <option value="created_at_desc">Relevancia</option>
                  <option value="precio_venta_asc">Precio ↑</option>
                  <option value="precio_venta_desc">Precio ↓</option>
                  <option value="nombre_asc">A-Z</option>
                </select>
              </div>

              {sortedProducts.length === 0 ? (
                <EmptyState title="No hay helados disponibles" message="Prueba con otra búsqueda o categoría" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => {
                    const hasOffer = !!product.precio_oferta;
                    const activePrice = hasOffer ? product.precio_oferta : product.precio_venta;
                    const regularPrice = hasOffer ? product.precio_venta : null;
                    const safePrice = (val) => (val ?? 0).toFixed(2);
                    const inWishlist = isInWishlist(product.id);
                    const badge = hasOffer ? 'Oferta' : product.id % 7 === 0 ? 'Más vendido' : product.id % 11 === 0 ? 'Nuevo' : null;

                    return (
                      <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
                        <div>
                          <Link to={`/product/${product.id}`} className="relative block overflow-hidden bg-gray-50">
                            {badge && (
                              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full uppercase z-10 shadow-sm ${
                                badge === 'Oferta' ? 'bg-yamboly-magenta text-white' :
                                badge === 'Más vendido' ? 'bg-yamboly-yellow text-yamboly-purple' :
                                'bg-yamboly-cyan text-white'
                              }`}>
                                {badge}
                              </span>
                            )}
                            <button
                              onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all"
                            >
                              <span className={inWishlist ? 'text-red-500' : 'text-gray-400'}>{inWishlist ? '❤️' : '🤍'}</span>
                            </button>
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
                              <span className="text-xl font-extrabold text-yamboly-purple">S/ {safePrice(activePrice)}</span>
                              {regularPrice != null && (
                                <span className="text-xs text-gray-400 line-through">S/ {safePrice(regularPrice)}</span>
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
