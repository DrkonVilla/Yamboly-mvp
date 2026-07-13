import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Filtro de stock crítico
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion_corta: '',
    precio_venta: '',
    categoria_id: '',
    stock: '',
    stock_minimo: '',
    imagen_url: '',
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      if (res.data.success) setProducts(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Producto desactivado');
      fetchProducts();
    } catch (error) {
      toast.error('Error al desactivar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        precio_venta: parseFloat(formData.precio_venta),
        categoria_id: parseInt(formData.categoria_id),
        stock: parseInt(formData.stock) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Producto actualizado');
      } else {
        await api.post('/products', payload);
        toast.success('Producto creado');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ sku: '', nombre: '', descripcion_corta: '', precio_venta: '', categoria_id: '', stock: '', stock_minimo: '', imagen_url: '' });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      nombre: product.nombre,
      descripcion_corta: product.descripcion_corta,
      precio_venta: product.precio_venta,
      categoria_id: product.categoria_id,
      stock: product.stock,
      stock_minimo: product.stock_minimo ?? 5,
      imagen_url: product.imagen_url || '',
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      nombre: '',
      descripcion_corta: '',
      precio_venta: '',
      categoria_id: '',
      stock: '0',
      stock_minimo: '5',
      imagen_url: '',
    });
    setShowModal(true);
  };

  // Filtrar productos por stock bajo si está activo
  const filteredProducts = products.filter((p) => {
    if (showLowStockOnly) {
      return p.stock <= p.stock_minimo;
    }
    return true;
  });

  if (loading) return <div className="text-center py-16">Cargando...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-baloo text-2xl font-bold text-yamboly-purple">Productos</h1>
          <p className="text-xs text-yamboly-purpleLight/70 font-medium">Gestiona el catálogo de helados de venta al público.</p>
        </div>
        <div className="flex gap-3 items-center w-full sm:w-auto justify-end">
          {/* Toggle de Stock Crítico */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
              showLowStockOnly
                ? 'bg-red-50 border-red-300 text-red-700 ring-1 ring-red-300'
                : 'bg-white border-gray-200 text-yamboly-purpleLight hover:bg-gray-50'
            }`}
          >
            ⚠️ Stock Crítico ({products.filter(p => p.stock <= p.stock_minimo).length})
          </button>

          <button
            onClick={openNew}
            className="bg-yamboly-cyan hover:bg-yamboly-cyan/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm transition-all transform active:scale-95 shrink-0"
          >
            <PlusIcon className="h-5 w-5 stroke-[2.5]" /> Nuevo producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-yamboly-purpleLight">
                    No hay productos {showLowStockOnly ? 'con stock bajo' : 'registrados'}.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isCritical = p.stock <= p.stock_minimo;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-yamboly-purple font-medium">{p.sku}</td>
                      <td className="px-6 py-4 text-sm font-bold text-yamboly-purple">{p.nombre}</td>
                      <td className="px-6 py-4 text-sm text-yamboly-purpleLight font-medium">{p.categoria?.nombre || '-'}</td>
                      <td className="px-6 py-4 text-sm text-yamboly-purpleLight">S/ {p.precio_venta.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {isCritical ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100 animate-pulse">
                            {p.stock} (Crítico ≤ {p.stock_minimo})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                            {p.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-yamboly-cyan hover:bg-yamboly-cyan/10 rounded-lg transition-all"
                            title="Editar"
                          >
                            <PencilIcon className="h-4.5 w-4.5 stroke-[2.2]" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Desactivar"
                          >
                            <TrashIcon className="h-4.5 w-4.5 stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-yamboly-purple/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-baloo text-lg font-bold text-yamboly-purple">
                {editingProduct ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">SKU</label>
                <input type="text" placeholder="Ej. YAM-CRE-001" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple font-mono" required />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Nombre</label>
                <input type="text" placeholder="Nombre del helado" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple" required />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Descripción corta</label>
                <input type="text" placeholder="Ej. Paleta de lúcuma peruana" value={formData.descripcion_corta} onChange={(e) => setFormData({ ...formData, descripcion_corta: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Precio (S/)</label>
                  <input type="number" step="0.01" placeholder="3.50" value={formData.precio_venta} onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Categoría</label>
                  <select value={formData.categoria_id} onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple bg-white" required>
                    <option value="">Seleccionar</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Stock</label>
                  <input type="number" placeholder="50" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Stock Mínimo</label>
                  <input type="number" placeholder="10" value={formData.stock_minimo} onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">URL de Imagen</label>
                <input type="url" placeholder="https://..." value={formData.imagen_url} onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple" />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="submit" className="flex-1 bg-yamboly-cyan hover:bg-yamboly-cyan/90 text-white py-2.5 rounded-xl text-sm font-bold transition-all">
                  Guardar
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2.5 rounded-xl text-sm font-bold text-yamboly-purple hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};