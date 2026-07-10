import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../stores/authStore';
import { Footer } from '../components/Footer';

export const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/my-orders/${id}`);
        if (response.data.success) {
          setOrder(response.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="text-center py-16 text-yamboly-purple">Cargando...</div>;
  if (!order) return <div className="text-center py-16 text-yamboly-purple">Orden no encontrada</div>;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl animate-bounce">🎉</span>
          </div>
          
          <h1 className="font-baloo text-3xl font-extrabold text-yamboly-purple mb-2">¡Pedido Confirmado con Éxito!</h1>
          <p className="text-sm text-yamboly-purpleLight mb-6">Gracias por confiar en Helados Yámboly. Tu orden está siendo procesada.</p>
          
          <div className="w-full max-w-md bg-gray-50 border border-gray-100 rounded-xl p-5 mb-8 text-left space-y-2">
            <div className="flex justify-between text-xs text-yamboly-purpleLight">
              <span>Nro. de Pedido:</span>
              <span className="font-mono font-bold text-yamboly-purple">#{order.id}</span>
            </div>
            <div className="flex justify-between text-xs text-yamboly-purpleLight">
              <span>Total Pagado:</span>
              <span className="font-bold text-yamboly-purple">S/ {order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-yamboly-purpleLight">
              <span>Estado del Pago:</span>
              <span className="font-bold text-emerald-600 capitalize">{order.estado}</span>
            </div>
            <div className="flex justify-between text-xs text-yamboly-purpleLight">
              <span>Método de Pago:</span>
              <span className="font-bold text-yamboly-purple capitalize">{order.metodo_pago}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              to="/"
              className="bg-yamboly-magenta text-white font-bold px-6 py-2.5 rounded-xl shadow hover:bg-yamboly-magenta/90 transition-all text-sm transform active:scale-95 text-center"
            >
              Volver a la Tienda
            </Link>
            {user?.rol === 'admin' && (
              <Link
                to="/admin/orders"
                className="border border-yamboly-purpleLight/30 text-yamboly-purple font-bold px-6 py-2.5 rounded-xl hover:bg-yamboly-cyanLight/10 transition-all text-sm text-center"
              >
                Gestionar Órdenes (Admin)
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};