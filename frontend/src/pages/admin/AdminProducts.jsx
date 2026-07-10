import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion_corta: '',
    precio_venta: '',
    categoria_id: '',
    stock: '',
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
      setFormData({ sku: '', nombre: '', descripcion_corta: '', precio_venta: '', categoria_id: '', stock: '', imagen_url: '' });
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
      imagen_url: product.imagen_url || '',
    });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-16">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button
          onClick={() => { setEditingProduct(null); setFormData({ sku: '', nombre: '', descripcion_corta: '', precio_venta: '', categoria_id: '', stock: '', imagen_url: '' }); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" /> Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 text-sm">{p.sku}</td>
                <td className="px-6 py-4 text-sm">{p.nombre}</td>
                <td className="px-6 py-4 text-sm">{p.categoria?.nombre || '-'}</td>
                <td className="px-6 py-4 text-sm">S/ {p.precio_venta.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={p.stock < p.stock_minimo ? 'text-red-600 font-bold' : ''}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="SKU" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full border rounded px-3 py-2" required />
              <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full border rounded px-3 py-2" required />
              <input type="text" placeholder="Descripción corta" value={formData.descripcion_corta} onChange={(e) => setFormData({ ...formData, descripcion_corta: e.target.value })} className="w-full border rounded px-3 py-2" required />
              <input type="number" step="0.01" placeholder="Precio (S/)" value={formData.precio_venta} onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })} className="w-full border rounded px-3 py-2" required />
              <select value={formData.categoria_id} onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })} className="w-full border rounded px-3 py-2" required>
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full border rounded px-3 py-2" />
              <input type="url" placeholder="URL de imagen (opcional)" value={formData.imagen_url} onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })} className="w-full border rounded px-3 py-2" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Guardar
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50">
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