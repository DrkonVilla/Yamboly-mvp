import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, XMarkIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  const [formData, setFormData] = useState({
    sku: '', nombre: '', descripcion_corta: '', precio_venta: '',
    categoria_id: '', stock: '', stock_minimo: '', imagen_url: '',
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      if (res.data.success) setProducts(res.data.data);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Producto desactivado exitosamente');
      fetchProducts();
    } catch (error) {
      toast.error('Error al desactivar el producto');
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
        toast.success('Producto actualizado exitosamente');
      } else {
        await api.post('/products', payload);
        toast.success('Nuevo producto agregado al catálogo');
      }
      closeDrawer();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ocurrió un error al guardar');
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku, nombre: product.nombre, descripcion_corta: product.descripcion_corta,
      precio_venta: product.precio_venta, categoria_id: product.categoria_id, stock: product.stock,
      stock_minimo: product.stock_minimo ?? 5, imagen_url: product.imagen_url || '',
    });
    setShowDrawer(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setFormData({
      sku: '', nombre: '', descripcion_corta: '', precio_venta: '',
      categoria_id: '', stock: '0', stock_minimo: '5', imagen_url: '',
    });
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setTimeout(() => {
      setEditingProduct(null);
    }, 300); // Wait for transition
  };

  const filteredProducts = products.filter((p) => showLowStockOnly ? p.stock <= p.stock_minimo : true);
  const criticalCount = products.filter(p => p.stock <= p.stock_minimo).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <ArrowPathIcon className="w-10 h-10 text-yamboly-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-baloo text-3xl font-extrabold text-slate-800 tracking-tight">Catálogo de Productos</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Gestión integral del inventario de venta al público.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 shadow-sm ${
              showLowStockOnly
                ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <ExclamationCircleIcon className={`w-5 h-5 ${showLowStockOnly ? 'text-red-500' : 'text-slate-400'}`} />
            Alertas de Stock
            <span className={`px-2 py-0.5 rounded-full text-xs ${showLowStockOnly ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-500'}`}>
              {criticalCount}
            </span>
          </button>

          <button
            onClick={openNew}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-[0_4px_12px_rgba(15,23,42,0.15)] transition-all transform hover:-translate-y-0.5"
          >
            <PlusIcon className="h-5 w-5 stroke-[2.5]" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-16">Img</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Producto</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Precio</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Estado (Stock)</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ArchiveBoxIcon className="w-12 h-12 text-slate-200 mb-3" />
                      <p className="text-slate-500 font-medium">No se encontraron productos que coincidan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isCritical = p.stock <= p.stock_minimo;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200/50">
                          {p.imagen_url ? (
                            <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <PhotoIcon className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{p.nombre}</p>
                        <p className="text-xs font-mono font-semibold text-slate-400 mt-0.5">{p.sku}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
                          {p.categoria?.nombre || 'Sin Categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-extrabold text-slate-700">S/ {p.precio_venta.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {isCritical ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                              Crítico
                            </span>
                            <span className="text-xs font-bold text-red-500">{p.stock} / {p.stock_minimo} min</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Óptimo
                            </span>
                            <span className="text-xs font-bold text-slate-500">{p.stock} unid.</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 text-slate-400 hover:text-yamboly-cyan hover:bg-yamboly-cyan/10 rounded-xl transition-all"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5 stroke-[2]" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Desactivar"
                          >
                            <TrashIcon className="h-5 w-5 stroke-[2]" />
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

      {/* Drawer Overlay */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeDrawer}></div>
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className={`pointer-events-auto w-screen max-w-md transform transition-transform duration-500 ease-in-out ${showDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-[var(--drawer-shadow)] shadow-2xl">
                
                <div className="bg-slate-50 px-6 py-6 sm:px-8 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-baloo font-bold text-slate-800" id="slide-over-title">
                      {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                    </h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button onClick={closeDrawer} className="rounded-md bg-transparent text-slate-400 hover:text-slate-600 focus:outline-none">
                        <span className="sr-only">Cerrar panel</span>
                        <XMarkIcon className="h-6 w-6 stroke-[2]" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {editingProduct ? 'Actualiza los datos del producto en la tienda.' : 'Ingresa la información básica para catalogar este ítem.'}
                  </p>
                </div>

                <div className="relative flex-1 px-6 py-6 sm:px-8">
                  <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Preview Block */}
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {formData.imagen_url ? (
                          <img src={formData.imagen_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = ''} />
                        ) : (
                          <PhotoIcon className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">URL de Imagen</label>
                        <input type="url" placeholder="https://ejemplo.com/img.jpg" value={formData.imagen_url} onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })} className="w-full border-0 bg-white rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-yamboly-cyan text-slate-700" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">SKU *</label>
                        <input type="text" placeholder="YAM-001" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-yamboly-cyan text-slate-800" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoría *</label>
                        <select value={formData.categoria_id} onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-yamboly-cyan text-slate-800 bg-white" required>
                          <option value="">Seleccionar</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Producto *</label>
                      <input type="text" placeholder="Ej. Paleta Clásica" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-yamboly-cyan text-slate-800" required />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descripción Corta *</label>
                      <textarea rows="2" placeholder="Describe brevemente el producto" value={formData.descripcion_corta} onChange={(e) => setFormData({ ...formData, descripcion_corta: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yamboly-cyan text-slate-800" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Precio (S/) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-2.5 text-slate-400 font-bold">S/</span>
                          <input type="number" step="0.01" placeholder="3.50" value={formData.precio_venta} onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })} className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-extrabold focus:ring-2 focus:ring-yamboly-cyan text-slate-800" required />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Stock Inicial</label>
                        <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yamboly-cyan text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-red-500">Stock Mínimo</label>
                        <input type="number" value={formData.stock_minimo} onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })} className="w-full border border-red-200 bg-red-50/30 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-400 text-red-700 font-bold" />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="border-t border-slate-100 p-6 bg-slate-50 flex gap-3">
                  <button type="button" onClick={closeDrawer} className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" form="product-form" className="flex-1 px-4 py-3 bg-yamboly-cyan hover:bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-md shadow-yamboly-cyan/20 hover:-translate-y-0.5 transition-all">
                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};