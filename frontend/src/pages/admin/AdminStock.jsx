import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  ChevronDownIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export const AdminStock = () => {
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchStock = async () => {
    try {
      const res = await api.get('/stock', {
        params: { tipo: filter || undefined }
      });
      if (res.data.success) {
        setStockMovements(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los movimientos de stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [filter]);

  const filteredStock = stockMovements.filter((m) => {
    const matchSearch = search
      ? m.producto?.nombre.toLowerCase().includes(search.toLowerCase()) || 
        m.producto?.sku.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchSearch;
  });

  const totalPages = Math.ceil(filteredStock.length / limit) || 1;
  const currentStock = filteredStock.slice((page - 1) * limit, page * limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <ArrowPathIcon className="w-10 h-10 text-yamboly-cyan animate-spin" />
      </div>
    );
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'entrada_compra': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'salida_venta': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ajuste_manual': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-baloo text-3xl font-extrabold text-slate-800 tracking-tight">Kardex y Movimientos</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Historial detallado de entradas, salidas y ajustes de inventario.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button 
            onClick={() => toast('Funcionalidad en desarrollo', { icon: '🏗️' })}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-[0_4px_12px_rgba(15,23,42,0.15)] transition-all transform hover:-translate-y-0.5"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 stroke-[2.5]" />
            Ajuste Manual
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <select 
            value={filter} 
            onChange={(e) => { setFilter(e.target.value); setPage(1); }} 
            className="w-full sm:w-56 appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan cursor-pointer"
          >
            <option value="">Todos los Movimientos</option>
            <option value="entrada_compra">Entradas (Compras)</option>
            <option value="salida_venta">Salidas (Ventas)</option>
            <option value="ajuste_manual">Ajustes Manuales</option>
          </select>
          <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none stroke-[3]" />
        </div>
        
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400 stroke-[2]" />
          <input 
            type="text" 
            placeholder="Buscar producto por nombre o SKU..." 
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
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Fecha y Hora</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Producto</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tipo Mov.</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Cant.</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Stock Ant.</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Stock Nuevo</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentStock.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ArchiveBoxIcon className="w-12 h-12 text-slate-200 mb-3" />
                      <p className="text-slate-500 font-medium">No se encontraron movimientos de stock.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentStock.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">{new Date(m.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{new Date(m.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{m.producto?.nombre || 'Desconocido'}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">SKU: {m.producto?.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getTypeStyle(m.tipo)}`}>
                        {m.tipo.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {m.cantidad > 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-rose-500" />
                        )}
                        <span className={`text-sm font-extrabold ${m.cantidad > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {m.cantidad > 0 ? '+' : ''}{m.cantidad}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-400">{m.stock_anterior}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-3 rounded-lg bg-slate-100 text-sm font-extrabold text-slate-700">
                        {m.stock_nuevo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-slate-700">{m.usuario?.nombre ? `${m.usuario.nombre} ${m.usuario.apellido}` : 'Sistema Auto'}</p>
                      {m.referencia_id && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase">
                          Ref: {m.referencia_tipo} #{m.referencia_id}
                        </p>
                      )}
                    </td>
                  </tr>
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
