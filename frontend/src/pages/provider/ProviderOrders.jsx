import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

const ESTADOS_COMPRA = ['pendiente', 'aprobada', 'recibida', 'cancelada'];

export const ProviderOrders = () => {
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
        params: { estado: filter || undefined, proveedor_id: user?.proveedor?.id || undefined }
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
    if (user?.proveedor?.id) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [filter, user]);

  const filteredOrders = orders.filter((o) => {
    const matchSearch = search
      ? o.id.toString().includes(search) || 
        o.proveedor?.nombre.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / limit) || 1;
  const currentOrders = filteredOrders.slice((page - 1) * limit, page * limit);

  if (loading) return <div className="text-center py-16">Cargando órdenes del proveedor...</div>;
  if (!user?.proveedor) return <div className="text-center py-16 text-red-500">Error: Cuenta no asociada a un proveedor.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis Órdenes de Compra</h1>

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
            placeholder="Buscar por ID..." 
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Emisión</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrega Est.</th>
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
                </tr>
                {expandedId === o.id && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={5} className="px-6 py-6">
                      <div>
                        <h4 className="font-bold text-sm text-yamboly-purple mb-3">Detalle de Insumos</h4>
                        <div className="bg-white border border-gray-200 rounded overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Insumo</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Cantidad</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio Unit.</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {o.items?.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-4 py-2 text-xs text-gray-500">{item.insumo?.sku}</td>
                                  <td className="px-4 py-2 text-sm font-medium text-yamboly-purple">{item.insumo?.nombre}</td>
                                  <td className="px-4 py-2 text-sm text-center">{item.cantidad}</td>
                                  <td className="px-4 py-2 text-sm text-right">S/ {((item.precio_unitario ?? 0)).toFixed(2)}</td>
                                  <td className="px-4 py-2 text-sm text-right font-semibold">S/ {((item.subtotal ?? 0)).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-end mt-4 text-sm">
                          <div className="w-48">
                            <div className="flex justify-between mb-1"><span className="text-gray-500">Subtotal:</span> <span>S/ {o.subtotal?.toFixed(2)}</span></div>
                            <div className="flex justify-between mb-1"><span className="text-gray-500">IGV (18%):</span> <span>S/ {o.impuestos?.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-yamboly-purple text-base border-t pt-1"><span className="text-gray-600">Total:</span> <span>S/ {o.total?.toFixed(2)}</span></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {currentOrders.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No tienes órdenes de compra registradas.
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
