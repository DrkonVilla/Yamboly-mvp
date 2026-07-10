import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore'; // Lo crearemos después
import api from '../api/axios';
import toast from 'react-hot-toast';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotal, getCartItemsForApi, clearCart } = useCartStore();
  const { user } = useAuthStore(); // Necesitamos el auth store
  const total = getTotal();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    direccion: '',
    ciudad: 'Lima',
    departamento: 'Lima',
    telefono: '',
    metodo_pago: 'tarjeta',
  });
  const [loading, setLoading] = useState(false);

  // Si no hay items, redirigir
  if (items.length === 0) {
    navigate('/');
    return null;
  }

  // Si no está autenticado, redirigir a login
  if (!user) {
    navigate('/login?redirect=/checkout');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        items: getCartItemsForApi(),
        direccion_envio: `${formData.direccion}, ${formData.ciudad}, ${formData.departamento}`,
        metodo_pago: formData.metodo_pago,
        canal: 'web',
      };

      const response = await api.post('/orders', payload);

      if (response.data.success) {
        toast.success('¡Orden creada exitosamente!');
        clearCart();
        navigate(`/order-confirmation/${response.data.data.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-baloo text-3xl font-bold mb-6 text-yamboly-purple">Procesar Pedido</h1>

        {/* Pasos */}
        <div className="flex gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm justify-around">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  s === step ? 'bg-yamboly-magenta text-white shadow-sm' : 'bg-gray-100 text-yamboly-purpleLight'
                }`}
              >
                {s}
              </div>
              <span className={`ml-2 text-xs font-bold ${s === step ? 'text-yamboly-purple' : 'text-yamboly-purpleLight/60'}`}>
                {s === 1 && 'Dirección'}
                {s === 2 && 'Método de Pago'}
                {s === 3 && 'Confirmación'}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-1.5">Dirección de Entrega</label>
                <input
                  type="text"
                  required
                  className="w-full border border-yamboly-purpleLight/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Av. Ejemplo 123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-1.5">Distrito / Ciudad</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-yamboly-purpleLight/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-1.5">Provincia / Departamento</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-yamboly-purpleLight/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-1.5">Teléfono de Contacto</label>
                <input
                  type="tel"
                  required
                  className="w-full border border-yamboly-purpleLight/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="999 999 999"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (formData.direccion && formData.ciudad && formData.departamento && formData.telefono) {
                    setStep(2);
                  } else {
                    toast.error('Por favor, completa todos los campos requeridos');
                  }
                }}
                className="w-full mt-4 bg-yamboly-magenta text-white py-3 rounded-xl font-bold text-sm shadow hover:bg-yamboly-magenta/90 transition-all transform active:scale-95"
              >
                Continuar al Pago →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-3">Selecciona un Método de Pago</label>
                <div className="space-y-3">
                  {['tarjeta', 'contraentrega', 'culqi'].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                        formData.metodo_pago === method
                          ? 'border-yamboly-cyan bg-yamboly-cyanLight/5 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="metodo_pago"
                        value={method}
                        checked={formData.metodo_pago === method}
                        onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                        className="text-yamboly-cyan focus:ring-yamboly-cyan h-4 w-4"
                      />
                      <span className="capitalize text-sm text-yamboly-purple">
                        {method === 'tarjeta' ? 'Tarjeta (Crédito/Débito)' : method === 'contraentrega' ? 'Pago Contraentrega' : 'Pago con Culqi'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-baloo text-base font-bold text-yamboly-purple mb-3">Resumen de la Compra</h4>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-yamboly-purple/80">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span>S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200/50 mt-3 pt-3 font-extrabold text-sm text-yamboly-purple flex justify-between">
                  <span>Total</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">* Precios incluyen IGV</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-yamboly-purpleLight/30 text-yamboly-purple py-3 rounded-xl hover:bg-yamboly-cyanLight/10 font-bold transition-all text-sm transform active:scale-95"
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-yamboly-magenta text-white py-3 rounded-xl font-bold transition-all text-sm shadow hover:bg-yamboly-magenta/90 transform active:scale-95"
                >
                  Revisar Pedido →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                <span className="text-xl">📋</span>
                <div>
                  <h3 className="font-bold text-emerald-800 text-sm">Resumen de Verificación</h3>
                  <p className="text-xs text-emerald-700">Por favor, confirma que toda la información ingresada sea correcta.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-xl p-4 shadow-sm bg-gray-50/30">
                  <h4 className="font-baloo text-sm font-bold text-yamboly-purple mb-2">Dirección de Envío</h4>
                  <p className="text-xs text-yamboly-purpleLight">{formData.direccion}</p>
                  <p className="text-xs text-yamboly-purpleLight">{formData.ciudad}, {formData.departamento}</p>
                  <p className="text-xs text-yamboly-purpleLight mt-1.5 font-semibold">Telf: {formData.telefono}</p>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 shadow-sm bg-gray-50/30">
                  <h4 className="font-baloo text-sm font-bold text-yamboly-purple mb-2">Método de Pago</h4>
                  <p className="text-xs text-yamboly-purpleLight capitalize font-semibold">{formData.metodo_pago}</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 shadow-sm">
                <h4 className="font-baloo text-sm font-bold text-yamboly-purple mb-3">Productos Solicitados</h4>
                <div className="space-y-2 mb-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-yamboly-purple/80">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span>S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200/50 pt-3 font-extrabold text-sm text-yamboly-purple flex justify-between">
                  <span>Total Final</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-yamboly-purpleLight/30 text-yamboly-purple py-3 rounded-xl hover:bg-yamboly-cyanLight/10 font-bold transition-all text-sm transform active:scale-95"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow hover:bg-emerald-700 disabled:opacity-50 transition-all transform active:scale-95"
                >
                  {loading ? 'Procesando...' : 'Confirmar y Pagar'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
};