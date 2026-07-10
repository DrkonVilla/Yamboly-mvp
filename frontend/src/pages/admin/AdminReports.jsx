import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { DocumentArrowDownIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export const AdminReports = () => {
  // Pre-llenar con rango de fechas de la campaña del seed para evitar reportes vacíos por defecto
  const [startDate, setStartDate] = useState('2025-12-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const downloadOrders = async () => {
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const url = `/reports/orders${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reporte-ordenes-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Reporte descargado');
    } catch (error) {
      toast.error('Error al descargar el reporte');
    } finally {
      setLoadingOrders(false);
    }
  };

  const downloadInventory = async () => {
    setLoadingInventory(true);
    try {
      const response = await api.get('/reports/inventory', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reporte-inventario-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Reporte descargado');
    } catch (error) {
      toast.error('Error al descargar el reporte');
    } finally {
      setLoadingInventory(false);
    }
  };

  return (
    <div>
      <h1 className="font-baloo text-3xl font-bold mb-6 text-yamboly-purple">📄 Reportes en PDF</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reporte de órdenes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-yamboly-cyan">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-yamboly-cyan/15 rounded-full flex items-center justify-center">
              <ClipboardDocumentListIcon className="h-6 w-6 text-yamboly-purple" />
            </div>
            <div>
              <h3 className="font-baloo text-lg font-bold text-yamboly-purple">Listado de Órdenes</h3>
              <p className="text-xs text-yamboly-purpleLight">Detalle de todas las órdenes del período seleccionado</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purpleLight mb-1.5">Fecha Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-yamboly-purpleLight/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purpleLight mb-1.5">Fecha Fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-yamboly-purpleLight/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                />
              </div>
            </div>
            
            <button
              onClick={downloadOrders}
              disabled={loadingOrders}
              className="w-full mt-4 bg-yamboly-magenta text-white py-2.5 rounded-xl font-bold text-sm shadow hover:bg-yamboly-magenta/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              {loadingOrders ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                <DocumentArrowDownIcon className="h-5 w-5" />
              )}
              {loadingOrders ? 'Generando Reporte...' : 'Descargar Reporte PDF'}
            </button>
          </div>
        </div>

        {/* Reporte de inventario */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-yamboly-magenta">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-yamboly-magenta/15 rounded-full flex items-center justify-center">
              <DocumentArrowDownIcon className="h-6 w-6 text-yamboly-purple" />
            </div>
            <div>
              <h3 className="font-baloo text-lg font-bold text-yamboly-purple">Inventario Actual</h3>
              <p className="text-xs text-yamboly-purpleLight">Stock y alertas de stock mínimo de helados</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-yamboly-purpleLight leading-relaxed">
              Genera de forma instantánea un reporte completo que lista el stock disponible, costo unitario y alertas críticas para productos que se encuentran por debajo del stock de seguridad configurado.
            </p>
            
            <button
              onClick={downloadInventory}
              disabled={loadingInventory}
              className="w-full bg-yamboly-cyan text-white py-2.5 rounded-xl font-bold text-sm shadow hover:bg-yamboly-cyan/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              {loadingInventory ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                <DocumentArrowDownIcon className="h-5 w-5" />
              )}
              {loadingInventory ? 'Generando Reporte...' : 'Descargar Inventario PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};