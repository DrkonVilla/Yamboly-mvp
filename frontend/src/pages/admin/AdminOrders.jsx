import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ESTADOS = ['pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'];

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders' + (filter ? `?estado=${filter}` : ''));
      if (res.data.success) setOrders(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { estado: newStatus });
      toast.success(`Estado actualizado a ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  if (loading) return <div className="text-center py-16">Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Órdenes</h1>

      <div className="mb-4 flex gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Todos</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button onClick={() => setFilter('')} className="border px-4 py-2 rounded hover:bg-gray-50">Limpiar</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-6 py-4 text-sm">#{o.id}</td>
                <td className="px-6 py-4 text-sm">{o.usuario?.nombre} {o.usuario?.apellido}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                    {o.canal}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">S/ {o.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${o.estado === 'entregada' ? 'bg-green-100 text-green-800' : ''}
                    ${o.estado === 'pagada' ? 'bg-blue-100 text-blue-800' : ''}
                    ${o.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${o.estado === 'cancelada' ? 'bg-red-100 text-red-800' : ''}
                    ${o.estado === 'enviada' ? 'bg-purple-100 text-purple-800' : ''}
                  `}>
                    {o.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={o.estado}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {ESTADOS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};