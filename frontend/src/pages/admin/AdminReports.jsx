import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { DocumentArrowDownIcon, ClipboardDocumentListIcon, ChartPieIcon, UsersIcon } from '@heroicons/react/24/outline';

const ReportCard = ({ title, description, icon: Icon, colorClass, onDownload, loading, requiresDateRange, children }) => (
  <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden group">
    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150 ${colorClass}`}></div>
    
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-10 shrink-0`}>
        <Icon className={`w-7 h-7 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h3 className="font-baloo text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5 leading-tight">{description}</p>
      </div>
    </div>

    <div className="flex-1 space-y-4 relative z-10 flex flex-col justify-end">
      {children}
      <button
        onClick={onDownload}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-sm
          ${loading 
            ? 'bg-slate-100 text-slate-400 cursor-wait' 
            : `text-white hover:-translate-y-0.5 shadow-md shadow-${colorClass.replace('bg-', '')}/20 ${colorClass}`
          }`}
      >
        {loading ? (
          <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></span>
        ) : (
          <DocumentArrowDownIcon className="h-5 w-5" />
        )}
        {loading ? 'Generando...' : 'Descargar PDF'}
      </button>
    </div>
  </div>
);

export const AdminReports = () => {
  const [startDate, setStartDate] = useState('2025-12-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const downloadReport = async (urlPath, filenamePrefix, setLoadingState, requiresDates = false) => {
    setLoadingState(true);
    try {
      let url = urlPath;
      if (requiresDates) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
      }
      
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filenamePrefix}-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      toast.error('Ocurrió un error al generar el reporte');
    } finally {
      setLoadingState(false);
    }
  };

  const handleDownloadOrders = () => downloadReport('/reports/orders', 'reporte-ordenes', setLoadingOrders, true);
  const handleDownloadInventory = () => downloadReport('/reports/inventory', 'reporte-inventario', setLoadingInventory, false);
  
  // Fake downloads for aesthetic reports to show full capability
  const handleDownloadFake = (setLoading) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Módulo de reporte avanzado en construcción');
    }, 1500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="font-baloo text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Centro de Reportes</h1>
        <p className="text-sm font-medium text-slate-500">Exporta analíticas y datos vitales de la plataforma en formato PDF.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Reporte de Órdenes */}
        <ReportCard 
          title="Historial de Órdenes" 
          description="Detalle completo de ventas y transacciones por período."
          icon={ClipboardDocumentListIcon}
          colorClass="bg-yamboly-cyan"
          onDownload={handleDownloadOrders}
          loading={loadingOrders}
        >
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Rango de Fechas Obligatorio</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border-0 bg-white rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-yamboly-cyan text-slate-600 shadow-sm" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border-0 bg-white rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-yamboly-cyan text-slate-600 shadow-sm" />
            </div>
          </div>
        </ReportCard>

        {/* Reporte de Inventario */}
        <ReportCard 
          title="Valorización de Inventario" 
          description="Estado actual del almacén y alertas críticas de stock."
          icon={DocumentArrowDownIcon}
          colorClass="bg-yamboly-magenta"
          onDownload={handleDownloadInventory}
          loading={loadingInventory}
        >
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 h-[100px] flex items-center justify-center text-center">
            <p className="text-xs text-slate-500 font-medium">Este reporte captura una "foto" del stock actual en tiempo real, no requiere rango de fechas.</p>
          </div>
        </ReportCard>



      </div>
    </div>
  );
};