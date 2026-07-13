import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../stores/authStore';
import { Footer } from '../components/Footer';

const STEPS = [
  { key: 'pendiente', label: 'Pedido Recibido', icon: '📝' },
  { key: 'pagado', label: 'Pago Confirmado', icon: '✅' },
  { key: 'enviado', label: 'En camino', icon: '🚚' },
  { key: 'entregado', label: 'Entregado', icon: '📦' },
];

const getActiveStep = (estado) => {
  const idx = STEPS.findIndex((s) => s.key === estado);
  return idx >= 0 ? idx : 0;
};

const COLD_ESTADOS = ['enviado', 'entregado'];

const ColdChainIndicator = ({ estado }) => {
  if (!COLD_ESTADOS.includes(estado)) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
      <span
        className="text-xl cursor-help"
        title="Nuestros vehículos de reparto cuentan con congeladoras que garantizan la temperatura óptima del producto durante todo el trayecto."
      >🌡️</span>
      <span className="text-sm font-semibold text-emerald-700">Cadena de frío monitoreada: −18 °C mantenido</span>
      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" title="Sensor en vivo"></span>
    </div>
  );
};

const OrderTimeline = ({ estado }) => {
  const activeStep = getActiveStep(estado);

  return (
    <div className="w-full mb-8">
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i <= activeStep
                    ? 'bg-yamboly-cyan text-white shadow-md'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i < activeStep ? '✓' : step.icon}
              </div>
              <span
                className={`text-xs mt-1 font-semibold ${
                  i <= activeStep ? 'text-yamboly-purple' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  i < activeStep ? 'bg-yamboly-cyan' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="sm:hidden space-y-3">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i <= activeStep
                  ? 'bg-yamboly-cyan text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {i < activeStep ? '✓' : step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-semibold ${
                  i <= activeStep ? 'text-yamboly-purple' : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
            </div>
            {i < activeStep && (
              <div className="w-0.5 h-6 bg-yamboly-cyan absolute left-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

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

          <OrderTimeline estado={order.estado} />
          <ColdChainIndicator estado={order.estado} />

          <div className="w-full max-w-md bg-gray-50 border border-gray-100 rounded-xl p-5 mb-8 text-left space-y-2">
            <div className="flex justify-between text-xs text-yamboly-purpleLight">
              <span>Nro. de Pedido:</span>
              <span className="font-mono font-bold text-yamboly-purple">#{order.id}</span>
            </div>
            <div className="flex justify-between text-xs text-yamboly-purpleLight">
              <span>Total Pagado:</span>
              <span className="font-bold text-yamboly-purple">S/ {(order.total ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-yamboly-purpleLight">
              <span>Estado del Pago:</span>
              <span className="font-bold text-emerald-600 capitalize">{order.estado}</span>
            </div>
            <div className="flex justify-between text-xs text-yamboly-purpleLight">
              <span>Método de Pago:</span>
              <span className="font-bold text-yamboly-purple capitalize">{order.metodo_pago}</span>
            </div>
            <div className="flex justify-between text-xs text-yamboly-purpleLight">
              <span>Canal de Venta:</span>
              <span className="font-bold text-yamboly-purple">
                {order.canal === 'web' && 'Pedido registrado vía Web 🌐'}
                {order.canal === 'rappi' && 'Pedido registrado vía Rappi 🛵'}
                {order.canal === 'tottus' && 'Pedido registrado vía Tottus 🏪'}
                {order.canal === 'tambo' && 'Pedido registrado vía Tambo 🏪'}
                {order.canal === 'tiktok' && 'Pedido registrado vía TikTok 🎵'}
                {!['web', 'rappi', 'tottus', 'tambo', 'tiktok'].includes(order.canal) && `Pedido registrado vía ${order.canal}`}
              </span>
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
