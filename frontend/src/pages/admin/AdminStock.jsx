import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

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

  if (loading) return <div className="text-center py-16">Cargando movimientos de stock...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Stock</h1>
        <button className="bg-yamboly-cyan text-white px-4 py-2 rounded shadow hover:bg-yamboly-cyan/90 transition-colors text-sm font-semibold">
          + Ajuste Manual
        </button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm">
            <option value="">Todos los Movimientos</option>
            <option value="entrada_compra">Entrada por Compra</option>
            <option value="salida_venta">Salida por Venta</option>
            <option value="ajuste_manual">Ajuste Manual</option>
          </select>
          <input 
            type="text" 
            placeholder="Buscar producto por nombre o SKU..." 
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Ant.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Nue.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario / Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentStock.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(m.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-semibold text-yamboly-purple">{m.producto?.nombre}</div>
                  <div className="text-xs text-gray-400">{m.producto?.sku}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${m.tipo === 'entrada_compra' ? 'bg-green-100 text-green-800' : ''}
                    ${m.tipo === 'salida_venta' ? 'bg-blue-100 text-blue-800' : ''}
                    ${m.tipo === 'ajuste_manual' ? 'bg-yellow-100 text-yellow-800' : ''}
                  `}>
                    {m.tipo.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`font-bold ${m.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.cantidad > 0 ? '+' : ''}{m.cantidad}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{m.stock_anterior}</td>
                <td className="px-6 py-4 text-sm font-bold text-yamboly-purple">{m.stock_nuevo}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {m.usuario?.nombre ? `${m.usuario.nombre} ${m.usuario.apellido}` : 'Sistema'}
                  {m.referencia_id && <div className="text-xs mt-1 text-gray-400">Ref: {m.referencia_tipo} #{m.referencia_id}</div>}
                </td>
              </tr>
            ))}
            {currentStock.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No se encontraron movimientos de stock.
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
