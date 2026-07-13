import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';
import { 
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <div className={`bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150 ${colorClass}`}></div>
    
    <div className="flex items-center gap-4 mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-10 shrink-0 shadow-inner`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">{title}</p>
      </div>
    </div>
    
    <div className="mt-auto relative z-10">
      <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{value}</p>
    </div>
  </div>
);

export const ProviderDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/purchase-orders', { params: { proveedor_id: user?.proveedor?.id } });
        if (res.data.success) {
          const orders = res.data.data;
          const pendiente = orders.filter(o => o.estado === 'pendiente').length;
          const aprobada = orders.filter(o => o.estado === 'aprobada').length;
          const recibida = orders.filter(o => o.estado === 'recibida').length;
          
          let subtotal_pendiente = 0;
          orders.filter(o => o.estado === 'pendiente' || o.estado === 'aprobada').forEach(o => {
            subtotal_pendiente += o.total;
          });

          setStats({
            total_orders: orders.length,
            pendiente,
            aprobada,
            recibida,
            revenue_pending: subtotal_pendiente
          });
        }
      } catch (error) {
        console.error('Error fetching provider stats', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.proveedor?.id) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <ArrowPathIcon className="w-10 h-10 text-yamboly-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-baloo text-3xl font-extrabold text-slate-800 tracking-tight">Portal del Proveedor</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Bienvenido, <span className="font-bold text-yamboly-purple">{user?.proveedor?.nombre || user?.nombre}</span>. Gestiona tus entregas y facturación.
          </p>
        </div>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Órdenes Pendientes" 
              value={stats.pendiente} 
              icon={ClockIcon} 
              colorClass="bg-amber-500" 
              delay={100}
            />
            <StatCard 
              title="Por Entregar" 
              value={stats.aprobada} 
              icon={TruckIcon} 
              colorClass="bg-yamboly-cyan" 
              delay={200}
            />
            <StatCard 
              title="Completadas" 
              value={stats.recibida} 
              icon={CheckBadgeIcon} 
              colorClass="bg-emerald-500" 
              delay={300}
            />
            <StatCard 
              title="Cuentas por Cobrar" 
              value={`S/ ${stats.revenue_pending.toFixed(2)}`} 
              icon={BanknotesIcon} 
              colorClass="bg-yamboly-magenta" 
              delay={400}
            />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-yamboly-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 max-w-lg text-center md:text-left">
              <h2 className="font-baloo text-2xl font-bold mb-2 text-slate-800">Visualiza el historial completo</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Revisa el detalle de todas las órdenes emitidas hacia ti, actualiza el estado de preparación y descarga comprobantes en formato PDF para tu propia contabilidad.
              </p>
              <Link 
                to="/provider/orders" 
                className="inline-flex items-center justify-center gap-2 bg-yamboly-cyan text-white px-8 py-3.5 rounded-full shadow-lg shadow-yamboly-cyan/30 hover:bg-cyan-500 transition-all font-bold tracking-wide transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <ClipboardDocumentCheckIcon className="w-5 h-5 stroke-[2]" />
                Ir a Mis Órdenes
              </Link>
            </div>
            
            <div className="relative z-10 shrink-0 hidden md:flex items-center justify-center w-48 h-48 bg-slate-50 rounded-full border-4 border-white shadow-xl">
               <div className="text-6xl animate-bounce-slow">📦</div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="font-bold mb-1">Cuenta Incompleta</h3>
            <p className="text-sm opacity-90">No se encontraron datos de proveedor asociados a tu cuenta. Contacta al administrador para vincular tu perfil B2B.</p>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};
