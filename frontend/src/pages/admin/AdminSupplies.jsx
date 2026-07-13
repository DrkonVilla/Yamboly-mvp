import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const AdminSupplies = () => {
  const [supplies, setSupplies] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const [selectedSupplyForStock, setSelectedSupplyForStock] = useState(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    proveedor_id: '',
    nombre: '',
    descripcion: '',
    unidad_medida: '',
    precio_unit: '',
    stock_actual: '',
    stock_minimo: '',
    activo: true,
  });

  const [stockData, setStockData] = useState({
    cantidad: '',
    tipo: 'ingreso',
    motivo: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliesRes, suppliersRes] = await Promise.all([
        api.get('/supplies'),
        api.get('/suppliers?includeInactive=false'),
      ]);
      if (suppliesRes.data.success) setSupplies(suppliesRes.data.data);
      if (suppliersRes.data.success) setSuppliers(suppliersRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar insumos o proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de desactivar este insumo?')) return;
    try {
      await api.delete(`/supplies/${id}`);
      toast.success('Insumo desactivado con éxito');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al desactivar insumo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        proveedor_id: parseInt(formData.proveedor_id),
        precio_unit: parseFloat(formData.precio_unit),
        stock_actual: parseFloat(formData.stock_actual) || 0,
        stock_minimo: parseFloat(formData.stock_minimo) || 0,
      };

      if (editingSupply) {
        await api.put(`/supplies/${editingSupply.id}`, payload);
        toast.success('Insumo actualizado con éxito');
      } else {
        await api.post('/supplies', payload);
        toast.success('Insumo creado con éxito');
      }
      setShowModal(false);
      setEditingSupply(null);
      setFormData({ proveedor_id: '', nombre: '', descripcion: '', unidad_medida: '', precio_unit: '', stock_actual: '', stock_minimo: '', activo: true });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar insumo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        cantidad: parseFloat(stockData.cantidad),
        tipo: stockData.tipo,
        motivo: stockData.motivo,
      };

      await api.put(`/supplies/${selectedSupplyForStock.id}/stock`, payload);
      toast.success('Stock ajustado correctamente');
      setShowStockModal(false);
      setSelectedSupplyForStock(null);
      setStockData({ cantidad: '', tipo: 'ingreso', motivo: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al ajustar stock');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (supply) => {
    setEditingSupply(supply);
    setFormData({
      proveedor_id: supply.proveedor_id,
      nombre: supply.nombre,
      descripcion: supply.descripcion || '',
      unidad_medida: supply.unidad_medida,
      precio_unit: supply.precio_unit,
      stock_actual: supply.stock_actual,
      stock_minimo: supply.stock_minimo,
      activo: supply.activo,
    });
    setShowModal(true);
  };

  const openStockAdjustment = (supply) => {
    setSelectedSupplyForStock(supply);
    setStockData({ cantidad: '', tipo: 'ingreso', motivo: '' });
    setShowStockModal(true);
  };

  const openNew = () => {
    setEditingSupply(null);
    setFormData({
      proveedor_id: suppliers.length > 0 ? suppliers[0].id : '',
      nombre: '',
      descripcion: '',
      unidad_medida: '',
      precio_unit: '',
      stock_actual: '',
      stock_minimo: '',
      activo: true,
    });
    setShowModal(true);
  };

  // Filtrado
  const filteredSupplies = supplies.filter((s) => {
    const matchesSearch = s.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesSupplier = selectedSupplierFilter === '' || s.proveedor_id === parseInt(selectedSupplierFilter);
    return matchesSearch && matchesSupplier;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSupplies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSupplies.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-baloo text-2xl font-bold text-yamboly-purple">Gestión de Insumos</h1>
          <p className="text-xs text-yamboly-purpleLight/70">Monitorea y ajusta los insumos e ingredientes de producción.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-yamboly-cyan hover:bg-yamboly-cyan/90 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm transition-all transform active:scale-95 shrink-0"
        >
          <PlusIcon className="h-5 w-5 stroke-[2.5]" /> Nuevo Insumo
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Búsqueda */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar insumo..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
            />
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          </div>

          {/* Filtro Proveedor */}
          <select
            value={selectedSupplierFilter}
            onChange={(e) => { setSelectedSupplierFilter(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple bg-white"
          >
            <option value="">Todos los Proveedores</option>
            {suppliers.map((prov) => (
              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-yamboly-purpleLight/60 font-semibold shrink-0">
          Mostrando {filteredSupplies.length} insumos en total
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="inline-block w-8 h-8 border-4 border-yamboly-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-yamboly-purpleLight font-semibold">Cargando insumos...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Nombre del Insumo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">U. Medida</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Precio Unit</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Stock Actual</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Stock Mínimo</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Alerta</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-sm text-yamboly-purpleLight">
                      No se encontraron insumos de acuerdo a los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((s) => {
                    const isLowStock = s.stock_actual < s.stock_minimo;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-yamboly-purple">{s.nombre}</td>
                        <td className="px-6 py-4 text-sm text-yamboly-purpleLight font-medium">{s.proveedor?.nombre || '-'}</td>
                        <td className="px-6 py-4 text-sm text-yamboly-purpleLight">{s.unidad_medida}</td>
                        <td className="px-6 py-4 text-sm text-yamboly-purpleLight">S/ {s.precio_unit.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-yamboly-purple">{s.stock_actual}</td>
                        <td className="px-6 py-4 text-sm text-yamboly-purpleLight/60">{s.stock_minimo}</td>
                        <td className="px-6 py-4 text-center">
                          {isLowStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 animate-pulse">
                              Stock Crítico
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                              Óptimo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => openStockAdjustment(s)}
                              className="p-2 text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-all"
                              title="Ajustar Stock"
                            >
                              <ArrowPathIcon className="h-5 w-5 stroke-2" />
                            </button>
                            <button
                              onClick={() => openEdit(s)}
                              className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                              title="Editar Insumo"
                            >
                              <PencilIcon className="h-5 w-5 stroke-2" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                              title="Eliminar Insumo"
                            >
                              <TrashIcon className="h-5 w-5 stroke-2" />
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-yamboly-purple bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-xs text-yamboly-purpleLight font-semibold">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-yamboly-purple bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Insumo (Crear/Editar) */}
      {showModal && (
        <div className="fixed inset-0 bg-yamboly-purple/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-baloo text-lg font-bold text-yamboly-purple">
                {editingSupply ? 'Editar Insumo' : 'Nuevo Insumo'}
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
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Nombre del Insumo</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Pulpa de Lúcuma"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Proveedor Autorizado</label>
                <select
                  required
                  value={formData.proveedor_id}
                  onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple bg-white"
                >
                  <option value="">Seleccionar Proveedor</option>
                  {suppliers.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} (RUC: {p.ruc})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Descripción (Opcional)</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Ej. Saco de azúcar blanca refinada de 50kg"
                  rows="2"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    required
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                    placeholder="Ej. Kg, Litros, Sacos"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Precio Unitario (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio_unit}
                    onChange={(e) => setFormData({ ...formData, precio_unit: e.target.value })}
                    placeholder="15.50"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    disabled={!!editingSupply}
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                    placeholder="100"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple disabled:opacity-60 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Stock Mínimo Alerta</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    placeholder="15"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-yamboly-cyan hover:bg-yamboly-cyan/90 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Guardando...' : 'Guardar Insumo'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-xl text-sm font-bold text-yamboly-purple hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajustar Stock */}
      {showStockModal && selectedSupplyForStock && (
        <div className="fixed inset-0 bg-yamboly-purple/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="font-baloo text-base font-bold text-yamboly-purple">
                  Ajuste Rápido de Stock
                </h2>
                <p className="text-[10px] text-yamboly-purpleLight font-semibold">
                  Insumo: {selectedSupplyForStock.nombre} | Actual: {selectedSupplyForStock.stock_actual} {selectedSupplyForStock.unidad_medida}
                </p>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAdjustStock} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Tipo de Ajuste</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockData({ ...stockData, tipo: 'ingreso' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      stockData.tipo === 'ingreso'
                        ? 'bg-green-50 border-green-400 text-green-700 font-extrabold'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Ingreso / Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockData({ ...stockData, tipo: 'egreso' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      stockData.tipo === 'egreso'
                        ? 'bg-red-50 border-red-400 text-red-700 font-extrabold'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Egreso / Salida (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">
                  Cantidad ({selectedSupplyForStock.unidad_medida})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={stockData.cantidad}
                  onChange={(e) => setStockData({ ...stockData, cantidad: e.target.value })}
                  placeholder="Ingresa la cantidad"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Motivo del Ajuste</label>
                <input
                  type="text"
                  required
                  value={stockData.motivo}
                  onChange={(e) => setStockData({ ...stockData, motivo: e.target.value })}
                  placeholder="Ej. Reposición de lote, Merma por derrame..."
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors ${
                    stockData.tipo === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submitting ? 'Ajustando...' : 'Confirmar Ajuste'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-xl text-sm font-bold text-yamboly-purple hover:bg-gray-50 transition-colors"
                >
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
