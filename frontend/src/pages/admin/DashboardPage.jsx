import { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { ArrowTrendingUpIcon, ShoppingCartIcon, CurrencyDollarIcon, PresentationChartLineIcon } from '@heroicons/react/24/solid';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const COLORS = ['#29B6E8', '#E6007E', '#FFD400', '#4B2E83', '#7B5EA7'];

const VENTAS_ESTACIONALES = [
  { mes: 'Abr', total: 820 },
  { mes: 'May', total: 640 },
  { mes: 'Jun', total: 510 },
  { mes: 'Jul', total: 480 },
  { mes: 'Ago', total: 520 },
  { mes: 'Sep', total: 600 },
  { mes: 'Oct', total: 710 },
  { mes: 'Nov', total: 890 },
  { mes: 'Dic', total: 1740 },
  { mes: 'Ene', total: 2150 },
  { mes: 'Feb', total: 1980 },
  { mes: 'Mar', total: 1560 },
];

let toastsShown = false;

const KpiCard = ({ title, amount, subtitle, icon: Icon, colorClass, trend }) => (
  <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden relative">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${colorClass}`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-800">{amount}</h3>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div className="flex items-center gap-2 relative z-10">
      <span className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        <ArrowTrendingUpIcon className={`w-3 h-3 ${trend < 0 && 'rotate-180'}`} />
        {Math.abs(trend)}%
      </span>
      <span className="text-xs font-semibold text-slate-400">{subtitle}</span>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [startDate, setStartDate] = useState('2025-12-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (toastsShown) return;
    toastsShown = true;
    const notifications = [
      { delay: 1500, msg: '🚀 Las métricas se han actualizado correctamente.', type: 'success' },
    ];
    const timers = notifications.map(n => 
      setTimeout(() => n.type === 'error' ? toast.error(n.msg) : toast.success(n.msg), n.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/dashboard?startDate=${startDate}&endDate=${endDate}`);
        if (response.data.success) {
          setStats(response.data.data);
        }
        const ordersRes = await api.get('/orders?limit=5');
        if (ordersRes.data.success) {
          setRecentOrders(ordersRes.data.data);
        }
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-yamboly-cyan/20 border-t-yamboly-magenta rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-4 border-yamboly-yellow/20 border-b-yamboly-cyan rounded-full animate-spin absolute top-2 left-2 animation-delay-150"></div>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-center py-16 text-slate-500 font-medium">No hay datos disponibles</div>;

  const { kpis, topProducts, ordersByStatus, ordersByChannel, dailySales } = stats;

  const statusData = ordersByStatus.map((s) => ({ name: s.estado, value: s._count }));
  const channelData = ordersByChannel.map((c) => ({ name: c.canal, value: c._count }));
  const topProductsData = topProducts.map((p) => ({
    name: p.nombre.length > 18 ? p.nombre.substring(0, 18) + '...' : p.nombre,
    vendidos: p.totalVendido,
  }));
  const dailyData = dailySales.map((d) => ({
    date: new Date(d.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
    ventas: Number(d.total) || 0,
  }));

  const getStatusBadge = (estado) => {
    const styles = {
      pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
      pagada: 'bg-blue-100 text-blue-700 border-blue-200',
      entregada: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelada: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return styles[estado] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'entregada': return <CheckCircleIcon className="w-4 h-4 mr-1" />;
      case 'cancelada': return <XCircleIcon className="w-4 h-4 mr-1" />;
      default: return <ClockIcon className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-baloo text-4xl font-extrabold text-slate-800 tracking-tight">Visión General</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Métricas y rendimiento de la plataforma en tiempo real.</p>
        </div>
        
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-0 bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-yamboly-cyan/50 outline-none" />
          <span className="text-slate-300 font-bold">-</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-0 bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-yamboly-cyan/50 outline-none" />
        </div>
      </div>

      {/* Tarjetas KPI Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Ingresos del Período" 
          amount={`S/ ${kpis.monthlyRevenue.toLocaleString('es-PE', {minimumFractionDigits: 2})}`} 
          subtitle="vs mes anterior" 
          icon={CurrencyDollarIcon} 
          colorClass="bg-yamboly-cyan" 
          trend={12.5} 
        />
        <KpiCard 
          title="Órdenes Totales" 
          amount={kpis.totalOrders} 
          subtitle="vs mes anterior" 
          icon={ShoppingCartIcon} 
          colorClass="bg-yamboly-magenta" 
          trend={8.2} 
        />
        <KpiCard 
          title="Ticket Promedio" 
          amount={`S/ ${kpis.avgTicketMonthly.toLocaleString('es-PE', {minimumFractionDigits: 2})}`} 
          subtitle="en este período" 
          icon={PresentationChartLineIcon} 
          colorClass="bg-yamboly-yellow" 
          trend={-2.4} 
        />
        <KpiCard 
          title="Ingresos Históricos" 
          amount={`S/ ${kpis.totalRevenue.toLocaleString('es-PE', {minimumFractionDigits: 2})}`} 
          subtitle="acumulado global" 
          icon={CurrencyDollarIcon} 
          colorClass="bg-yamboly-purple" 
          trend={15.0} 
        />
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico Principal de Ventas (Area Chart modernizado) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-baloo text-xl font-bold text-slate-800">Tendencia de Ventas Diarias</h3>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Reporte Activo</span>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#29B6E8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#29B6E8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `S/${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#29B6E8' }}
                />
                <Area type="monotone" dataKey="ventas" stroke="#29B6E8" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" activeDot={{ r: 6, fill: '#E6007E', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Órdenes por Canal (Donut) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
          <h3 className="font-baloo text-xl font-bold text-slate-800 mb-2">Canales de Venta</h3>
          <p className="text-xs text-slate-400 font-medium mb-6">Distribución de ingresos por canal</p>
          <div className="flex-1 flex justify-center relative min-h-[250px]">
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Pie
                    data={channelData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <span className="text-slate-400 text-sm font-medium">Sin datos</span>
              </div>
            )}
            
            {/* Custom Legend */}
            <div className="absolute -bottom-2 w-full flex flex-wrap justify-center gap-3">
              {channelData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 capitalize">
                  <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Órdenes Recientes - Embedded Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-baloo text-xl font-bold text-slate-800">Órdenes Recientes</h3>
            <button className="text-xs font-bold text-yamboly-magenta hover:text-yamboly-magenta/80 transition-colors">Ver todas →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Monto</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-sm text-slate-400">No hay órdenes recientes</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">#{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{order.usuario?.nombre} {order.usuario?.apellido}</p>
                        <p className="text-xs text-slate-500">{order.canal} • {new Date(order.created_at).toLocaleDateString('es-PE')}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-extrabold text-slate-700">
                        S/ {Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getStatusBadge(order.estado)}`}>
                          {getStatusIcon(order.estado)}
                          {order.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Productos Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <h3 className="font-baloo text-xl font-bold text-slate-800 mb-6">Top Productos</h3>
          <div className="min-h-[250px]">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                />
                <Bar dataKey="vendidos" fill="#4B2E83" radius={[0, 8, 8, 0]} barSize={20}>
                  {topProductsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};