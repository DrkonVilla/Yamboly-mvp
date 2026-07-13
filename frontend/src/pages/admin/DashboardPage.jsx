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
} from 'recharts';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const COLORS = ['#29B6E8', '#E6007E', '#FFD400', '#4B2E83', '#7B5EA7'];

let toastsShown = false;

export const DashboardPage = () => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [startDate, setStartDate] = useState('2025-12-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (toastsShown) return;
    toastsShown = true;
    const notifications = [
      { delay: 1500, msg: '🔔 Nuevo pedido recibido desde Rappi', type: 'success' },
      { delay: 4000, msg: '⚠️ Stock bajo: Chocobombom (3 unidades)', type: 'error' },
      { delay: 7000, msg: '📦 Pedido #24 marcado como entregado', type: 'success' },
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamboly-purple"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-16">No hay datos disponibles</div>;
  }

  const { kpis, topProducts, ordersByStatus, ordersByChannel, dailySales } = stats;

  // Preparar datos para gráficos
  const statusData = ordersByStatus.map((s) => ({
    name: s.estado,
    value: s._count,
  }));

  const channelData = ordersByChannel.map((c) => ({
    name: c.canal,
    value: c._count,
    total: c._sum.total || 0,
  }));

  const topProductsData = topProducts.map((p) => ({
    name: p.nombre.length > 20 ? p.nombre.substring(0, 20) + '...' : p.nombre,
    vendidos: p.totalVendido,
  }));

  const dailyData = dailySales.map((d) => ({
    date: new Date(d.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
    ventas: Number(d.total) || 0,
    ordenes: Number(d.count) || 0,
  }));

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="font-baloo text-2xl font-bold text-yamboly-purple">Dashboard de Ventas</h1>
        
        {/* Date Filter Toolbar */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-yamboly-purpleLight uppercase">Filtro:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-yamboly-purpleLight uppercase">a</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
            />
          </div>
          <button
            onClick={() => {
              setStartDate('2025-12-01');
              setEndDate('2026-03-31');
            }}
            className="text-xs text-yamboly-magenta hover:text-yamboly-magenta/80 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-yamboly-cyan">
          <p className="text-xs font-bold text-yamboly-purpleLight uppercase tracking-wider mb-1">Ventas del período</p>
          <p className="text-2xl font-extrabold text-yamboly-purple">S/ {kpis.monthlyRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">{kpis.monthlyOrders} órdenes</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-yamboly-magenta">
          <p className="text-xs font-bold text-yamboly-purpleLight uppercase tracking-wider mb-1">Ticket promedio</p>
          <p className="text-2xl font-extrabold text-yamboly-purple">S/ {kpis.avgTicketMonthly.toFixed(2)}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">En el período</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-yamboly-yellow">
          <p className="text-xs font-bold text-yamboly-purpleLight uppercase tracking-wider mb-1">Total de órdenes</p>
          <p className="text-2xl font-extrabold text-yamboly-purple">{kpis.totalOrders}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Histórico acumulado</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-yamboly-purple">
          <p className="text-xs font-bold text-yamboly-purpleLight uppercase tracking-wider mb-1">Ingreso total</p>
          <p className="text-2xl font-extrabold text-yamboly-purple">S/ {kpis.totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Todos los tiempos</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas diarias (últimos 7 días) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-baloo text-lg font-bold text-yamboly-purple mb-4">Ventas Diarias</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#29B6E8" strokeWidth={2} name="Monto (S/)" />
              <Line type="monotone" dataKey="ordenes" stroke="#E6007E" strokeWidth={2} name="Órdenes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ventas por canal (EL GRÁFICO ESTRELLA) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-baloo text-lg font-bold text-yamboly-purple mb-4">
            Ventas por Canal <span className="text-xs font-semibold text-yamboly-purpleLight lowercase">(e‑business)</span>
          </h3>
          {channelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} órdenes`, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No hay datos de canales aún</p>
          )}
          <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">
            Distribución de órdenes por canal (web, rappi, tottus, tambo)
          </p>
        </div>

        {/* Top 5 productos */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-baloo text-lg font-bold text-yamboly-purple mb-4">Top 5 Productos más Vendidos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProductsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="vendidos" fill="#4B2E83" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Órdenes por estado */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-baloo text-lg font-bold text-yamboly-purple mb-4">Órdenes por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};