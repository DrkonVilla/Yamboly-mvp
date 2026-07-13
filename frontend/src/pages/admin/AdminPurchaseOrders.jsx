import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

const ESTADOS_COMPRA = ['pendiente', 'aprobada', 'recibida', 'cancelada'];

export const AdminPurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const limit = 10;
  
  const { user } = useAuthStore();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/purchase-orders', {
        params: { estado: filter || undefined }
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las órdenes de compra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/purchase-orders/${orderId}/status`, { estado: newStatus });
      toast.success(`Estado de orden actualizado a ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch = search
      ? o.id.toString().includes(search) || 
        o.proveedor?.nombre.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / limit) || 1;
  const currentOrders = filteredOrders.slice((page - 1) * limit, page * limit);

  if (loading) return <div className="text-center py-16">Cargando órdenes de compra...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
        <button className="bg-yamboly-cyan text-white px-4 py-2 rounded shadow hover:bg-yamboly-cyan/90 transition-colors text-sm font-semibold">
          + Nueva Orden
        </button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm">
            <option value="">Todos los Estados</option>
            {ESTADOS_COMPRA.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Buscar por ID o proveedor..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 text-sm w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"># OC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Creación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrega Est.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentOrders.map((o) => (
              <React.Fragment key={o.id}>
                <tr className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                  <td className="px-6 py-4 text-sm font-semibold text-yamboly-purple">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{expandedId === o.id ? '▼' : '▶'}</span>
                      OC-{o.id.toString().padStart(4, '0')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{o.proveedor?.nombre || 'Proveedor Desconocido'}</td>
                  <td className="px-6 py-4 text-sm font-bold">S/ {o.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                      ${o.estado === 'recibida' ? 'bg-green-100 text-green-800' : ''}
                      ${o.estado === 'aprobada' ? 'bg-blue-100 text-blue-800' : ''}
                      ${o.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${o.estado === 'cancelada' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {o.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">{o.fecha_entrega ? new Date(o.fecha_entrega).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.estado}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm bg-white"
                      disabled={user?.rol !== 'admin' && user?.rol !== 'ejecutivo'}
                    >
                      {ESTADOS_COMPRA.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                {expandedId === o.id && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={7} className="px-6 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-sm text-yamboly-purple mb-3">Insumos Solicitados</h4>
                          <div className="space-y-2">
                            {o.items?.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm border border-gray-100">
                                <div>
                                  <span className="font-semibold text-yamboly-purple">{item.insumo?.nombre || 'Insumo'}</span>
                                  <span className="text-xs text-gray-400 ml-2">SKU: {item.insumo?.sku}</span>
                                  <div className="text-gray-500">Cantidad: {item.cantidad}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-400">S/ {((item.precio_unitario ?? 0)).toFixed(2)} c/u</div>
                                  <div className="font-bold text-yamboly-purple">S/ {((item.subtotal ?? 0)).toFixed(2)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-bold text-sm text-yamboly-purple mb-2">Detalles Adicionales</h4>
                            <div className="bg-white p-3 rounded shadow-sm border border-gray-100 text-sm">
                              <p className="mb-1"><span className="text-gray-500">Subtotal:</span> <span className="font-medium">S/ {o.subtotal?.toFixed(2)}</span></p>
                              <p className="mb-1"><span className="text-gray-500">Impuestos (18%):</span> <span className="font-medium">S/ {o.impuestos?.toFixed(2)}</span></p>
                              <p><span className="text-gray-500">Total a pagar:</span> <span className="font-bold text-yamboly-purple">S/ {o.total?.toFixed(2)}</span></p>
                            </div>
                          </div>
                          {o.estado === 'aprobada' && (
                            <button 
                              onClick={() => handleStatusChange(o.id, 'recibida')}
                              className="w-full bg-yamboly-cyan text-white px-4 py-2 rounded shadow text-sm font-bold transform active:scale-95 transition-all hover:bg-yamboly-cyan/90"
                            >
                              Marcar como Recibida
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {currentOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No se encontraron órdenes de compra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm font-medium"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 text-sm font-medium"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
