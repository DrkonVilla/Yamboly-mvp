import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <ArrowPathIcon className="w-10 h-10 text-yamboly-cyan animate-spin" />
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'recibida': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'aprobada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pendiente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelada': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-baloo text-3xl font-extrabold text-slate-800 tracking-tight">Órdenes de Compra</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Gestión de abastecimiento y relación con proveedores B2B.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button 
            onClick={() => toast('Funcionalidad en desarrollo', { icon: '🏗️' })}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-[0_4px_12px_rgba(15,23,42,0.15)] transition-all transform hover:-translate-y-0.5"
          >
            <PlusIcon className="h-5 w-5 stroke-[2.5]" />
            Nueva Orden
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <select 
            value={filter} 
            onChange={(e) => { setFilter(e.target.value); setPage(1); }} 
            className="w-full sm:w-48 appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan cursor-pointer"
          >
            <option value="">Todos los Estados</option>
            {ESTADOS_COMPRA.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none stroke-[3]" />
        </div>
        
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400 stroke-[2]" />
          <input 
            type="text" 
            placeholder="Buscar por ID o Proveedor..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl pl-10 pr-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-16">ID</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Proveedor</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Fechas</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <DocumentTextIcon className="w-12 h-12 text-slate-200 mb-3" />
                      <p className="text-slate-500 font-medium">No se encontraron órdenes de compra.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentOrders.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${expandedId === o.id ? 'bg-slate-50/80' : ''}`} 
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full transition-colors ${expandedId === o.id ? 'bg-yamboly-cyan text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                            {expandedId === o.id ? <ChevronDownIcon className="w-3 h-3 stroke-[3]" /> : <ChevronRightIcon className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span className="text-sm font-mono font-bold text-slate-700">#{o.id.toString().padStart(4, '0')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{o.proveedor?.nombre || 'Desconocido'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-extrabold text-slate-700">S/ {o.total.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getStatusStyle(o.estado)}`}>
                          {o.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500 font-medium"><span className="text-slate-400 font-bold">Creada:</span> {new Date(o.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5"><span className="text-slate-400 font-bold">Entrega:</span> {o.fecha_entrega ? new Date(o.fecha_entrega).toLocaleDateString() : 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {user?.rol === 'admin' || user?.rol === 'ejecutivo' ? (
                          <div className="flex justify-end gap-2">
                            {o.estado === 'pendiente' && (
                              <button
                                onClick={() => handleStatusChange(o.id, 'aprobada')}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition-colors uppercase tracking-wider"
                              >
                                Aprobar
                              </button>
                            )}
                            {o.estado === 'aprobada' && (
                              <button
                                onClick={() => handleStatusChange(o.id, 'recibida')}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors uppercase tracking-wider"
                              >
                                Recibir
                              </button>
                            )}
                            {(o.estado === 'pendiente' || o.estado === 'aprobada') && (
                              <button
                                onClick={() => handleStatusChange(o.id, 'cancelada')}
                                className="bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors uppercase tracking-wider"
                              >
                                Cancelar
                              </button>
                            )}
                            {o.estado === 'recibida' || o.estado === 'cancelada' ? (
                              <span className="text-xs text-slate-400 font-medium italic">Sin acciones</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Solo lectura</span>
                        )}
                      </td>
                    </tr>
                    {/* Expanded details */}
                    {expandedId === o.id && (
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <td colSpan="6" className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                              <h4 className="font-baloo text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Insumos Solicitados</h4>
                              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-50/80">
                                    <tr>
                                      <th className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase">Insumo</th>
                                      <th className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase text-center">Cant</th>
                                      <th className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase text-right">P.U.</th>
                                      <th className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase text-right">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {o.items?.map((item) => (
                                      <tr key={item.id} className="hover:bg-slate-50/30">
                                        <td className="px-4 py-3">
                                          <p className="text-sm font-bold text-slate-700">{item.insumo?.nombre || 'Insumo'}</p>
                                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {item.insumo?.sku}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-medium text-slate-600">{item.cantidad}</td>
                                        <td className="px-4 py-3 text-right text-xs text-slate-500">S/ {((item.precio_unitario ?? 0)).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">S/ {((item.subtotal ?? 0)).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-baloo text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Resumen</h4>
                              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-500 font-medium">Subtotal</span>
                                  <span className="font-bold text-slate-700">S/ {o.subtotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-500 font-medium">Impuestos (18%)</span>
                                  <span className="font-bold text-slate-700">S/ {o.impuestos?.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-slate-100 w-full my-2"></div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-700 font-extrabold uppercase text-xs">Total a Pagar</span>
                                  <span className="text-xl font-black text-yamboly-cyan">S/ {o.total?.toFixed(2)}</span>
                                </div>
                                
                                {o.estado === 'aprobada' && (
                                  <button 
                                    onClick={() => handleStatusChange(o.id, 'recibida')}
                                    className="w-full mt-4 bg-yamboly-cyan hover:bg-cyan-500 text-white px-4 py-3 rounded-xl shadow-md shadow-yamboly-cyan/20 text-xs font-bold uppercase tracking-wider transform hover:-translate-y-0.5 transition-all"
                                  >
                                    Marcar como Recibida
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-slate-200 bg-white rounded-xl disabled:opacity-50 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
            {page} / {totalPages}
          </span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-slate-200 bg-white rounded-xl disabled:opacity-50 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
