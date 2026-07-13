import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';

export const ProviderDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simplified request to just get orders for the provider and count them locally if backend dashboard endpoint doesn't exist
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

  if (loading) return <div className="text-center py-16">Cargando dashboard del proveedor...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Panel del Proveedor</h1>
      <p className="text-gray-500 mb-6">Bienvenido, {user?.proveedor?.nombre || user?.nombre}</p>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-400">
            <h3 className="text-gray-500 text-sm font-medium">Órdenes Pendientes</h3>
            <p className="text-3xl font-bold mt-2 text-yamboly-purple">{stats.pendiente}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-400">
            <h3 className="text-gray-500 text-sm font-medium">Órdenes Aprobadas (Por Entregar)</h3>
            <p className="text-3xl font-bold mt-2 text-yamboly-purple">{stats.aprobada}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-400">
            <h3 className="text-gray-500 text-sm font-medium">Órdenes Completadas</h3>
            <p className="text-3xl font-bold mt-2 text-yamboly-purple">{stats.recibida}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yamboly-magenta">
            <h3 className="text-gray-500 text-sm font-medium">Cuentas por Cobrar Estimadas</h3>
            <p className="text-3xl font-bold mt-2 text-yamboly-purple">S/ {stats.revenue_pending.toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded text-yellow-800">
          No se encontraron datos de proveedor asociados a esta cuenta.
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4 text-yamboly-purple">Acceso Rápido</h2>
        <div className="flex gap-4">
          <a href="/provider/orders" className="bg-yamboly-cyan text-white px-6 py-3 rounded shadow hover:bg-yamboly-cyan/90 transition-colors font-semibold">
            Ver todas las órdenes de compra
          </a>
        </div>
      </div>
    </div>
  );
};
