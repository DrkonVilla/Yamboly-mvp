import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CreditCard3D } from '../components/CreditCard3D';

const safePrice = (val) => (val ?? 0).toFixed(2);

const isValidLuhn = (num) => {
  const digits = num.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
};

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

const isExpired = (expiry) => {
  const [mm, yy] = expiry.split('/');
  if (!mm || !yy || mm.length < 2 || yy.length < 2) return false;
  const now = new Date();
  const exp = new Date(2000 + parseInt(yy), parseInt(mm), 0);
  return exp < now;
};

const PAYMENT_METHODS = [
  { id: 'tarjeta', label: 'Tarjeta Débito/Crédito', icon: '💳' },
  { id: 'yape', label: 'Yape', icon: '📱' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
  { id: 'culqi', label: 'Culqi', icon: '⚡' },
  { id: 'contraentrega', label: 'Contraentrega', icon: '💵' },
];

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotal, getCartItemsForApi, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const total = getTotal();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    direccion: '',
    ciudad: 'Lima',
    departamento: 'Lima',
    telefono: '',
    metodo_pago: 'tarjeta',
  });
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
  const [cvvFocused, setCvvFocused] = useState(false);
  const [culqiData, setCulqiData] = useState({ correo: '', dni: '', celular: '' });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  if (!user) {
    navigate('/login?redirect=/checkout');
    return null;
  }

  const simulatePayment = async () => {
    setLoading(true);
    setLoadingMessage('Verificando con el banco...');
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingMessage('Procesando transacción...');
    await new Promise((r) => setTimeout(r, 1500));

    if (formData.metodo_pago === 'tarjeta') {
      const cleanNumber = cardData.number.replace(/\s/g, '');
      if (cleanNumber.endsWith('0000')) {
        setLoading(false);
        setLoadingMessage('');
        toast.error('Tarjeta declinada. Fondos insuficientes.');
        return;
      }
    }

    setLoadingMessage('¡Pago aprobado!');
    await new Promise((r) => setTimeout(r, 800));

    try {
      const payload = {
        items: getCartItemsForApi(),
        direccion_envio: `${formData.direccion}, ${formData.ciudad}, ${formData.departamento}`,
        metodo_pago: formData.metodo_pago,
        canal: 'web',
      };
      const response = await api.post('/orders', payload);
      if (response.data.success) {
        toast.success('¡Pago exitoso!');
        clearCart();
        navigate(`/order-confirmation/${response.data.data.id}`);
      }
    } catch (error) {
      toast.error('Error al crear la orden');
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.metodo_pago === 'tarjeta') {
      if (!isValidLuhn(cardData.number)) {
        toast.error('Número de tarjeta inválido');
        return;
      }
      if (isExpired(cardData.expiry)) {
        toast.error('La tarjeta está vencida');
        return;
      }
      if (cardData.cvv.length < 3) {
        toast.error('CVV inválido');
        return;
      }
    }
    if (formData.metodo_pago === 'yape') {
      toast.success('Escanea el QR con Yape para pagar');
      return;
    }
    if (formData.metodo_pago === 'paypal') {
      setLoading(true);
      setLoadingMessage('Redirigiendo a PayPal...');
      setTimeout(() => {
        setLoading(false);
        setLoadingMessage('');
        toast.success('Pago con PayPal simulado exitosamente');
        const payload = {
          items: getCartItemsForApi(),
          direccion_envio: `${formData.direccion}, ${formData.ciudad}, ${formData.departamento}`,
          metodo_pago: 'paypal',
          canal: 'web',
        };
        api.post('/orders', payload).then((res) => {
          if (res.data.success) {
            clearCart();
            navigate(`/order-confirmation/${res.data.data.id}`);
          }
        });
      }, 2000);
      return;
    }

    simulatePayment();
  };

  const cardNumberValid = cardData.number.length > 0 && isValidLuhn(cardData.number);
  const cardNumberError = cardData.number.length > 6 && !isValidLuhn(cardData.number.replace(/\s/g, ''));
  const expiryValid = cardData.expiry.length === 5 && !isExpired(cardData.expiry);
  const cvvValid = cardData.cvv.length === 3;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="font-baloo text-3xl font-bold mb-6 text-yamboly-purple">Procesar Pedido</h1>

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

        <div className="flex flex-col lg:flex-row gap-6">
          <form onSubmit={handleSubmit} className="flex-1 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
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
                      toast.error('Completa todos los campos requeridos');
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, metodo_pago: method.id })}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.metodo_pago === method.id
                            ? 'border-yamboly-cyan bg-yamboly-cyanLight/10 shadow-sm'
                            : 'border-gray-200 hover:border-yamboly-cyanLight/50 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <span className="text-xs font-semibold text-yamboly-purple text-center leading-tight">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.metodo_pago === 'tarjeta' && (
                  <div className="space-y-4">
                    <CreditCard3D
                      number={cardData.number}
                      name={user?.nombre || ''}
                      expiry={cardData.expiry}
                      isFlipped={cvvFocused}
                    />
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-1.5">Número de tarjeta</label>
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                          placeholder="**** **** **** ****"
                          maxLength={19}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            cardNumberError ? 'border-red-400 focus:ring-red-400' : cardNumberValid ? 'border-green-400 focus:ring-green-400' : 'border-yamboly-purpleLight/30 focus:ring-yamboly-cyan'
                          } text-yamboly-purple`}
                        />
                        {cardNumberValid && <span className="absolute right-3 top-8 text-green-500 text-lg">✓</span>}
                        {cardNumberError && <span className="absolute right-3 top-8 text-red-400 text-xs">N° inválido</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-1.5">Fecha Exp.</label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                            placeholder="MM/AA"
                            maxLength={5}
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                              cardData.expiry.length === 5 && !expiryValid ? 'border-red-400 focus:ring-red-400' : expiryValid ? 'border-green-400 focus:ring-green-400' : 'border-yamboly-purpleLight/30 focus:ring-yamboly-cyan'
                            } text-yamboly-purple`}
                          />
                          {expiryValid && <span className="absolute right-3 top-8 text-green-500 text-lg">✓</span>}
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-1.5">CVV</label>
                          <input
                            type="text"
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                            onFocus={() => setCvvFocused(true)}
                            onBlur={() => setCvvFocused(false)}
                            placeholder="***"
                            maxLength={3}
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                              cvvValid ? 'border-green-400 focus:ring-green-400' : 'border-yamboly-purpleLight/30 focus:ring-yamboly-cyan'
                            } text-yamboly-purple`}
                          />
                          {cvvValid && <span className="absolute right-3 top-8 text-green-500 text-lg">✓</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formData.metodo_pago === 'yape' && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <img src="/qr-yape.svg" alt="QR Yape" className="w-48 h-48 border-2 border-yamboly-cyan rounded-xl p-2" />
                    <p className="text-sm text-yamboly-purple text-center">
                      1. Abre Yape en tu celular<br />
                      2. Escanea este código QR<br />
                      3. Confirma el pago
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        toast.success('Simulando espera de pago Yape...');
                        setTimeout(() => {
                          toast.success('Pago Yape recibido');
                          const payload = {
                            items: getCartItemsForApi(),
                            direccion_envio: `${formData.direccion}, ${formData.ciudad}, ${formData.departamento}`,
                            metodo_pago: 'yape',
                            canal: 'web',
                          };
                          api.post('/orders', payload).then((res) => {
                            if (res.data.success) {
                              clearCart();
                              navigate(`/order-confirmation/${res.data.data.id}`);
                            }
                          });
                        }, 3000);
                      }}
                      className="bg-yamboly-cyan text-white px-6 py-2 rounded-xl font-bold text-sm shadow hover:bg-yamboly-cyan/80 transition-all"
                    >
                      Simular pago Yape
                    </button>
                  </div>
                )}

                {formData.metodo_pago === 'paypal' && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <span className="text-5xl">🅿️</span>
                    <p className="text-sm text-yamboly-purple text-center">Serás redirigido a PayPal para completar el pago</p>
                    <p className="text-xs text-gray-400">Simulación: auto-aprobación en 2 segundos</p>
                  </div>
                )}

                {formData.metodo_pago === 'culqi' && (
                  <div className="space-y-4 py-2">
                    <div className="bg-yamboly-cyanLight/10 border border-yamboly-cyan/20 rounded-xl p-4">
                      <p className="text-xs font-bold text-yamboly-purple mb-3">Pago con Culqi (simulado)</p>
                      <div className="space-y-3">
                        <input
                          type="email"
                          placeholder="Correo electrónico"
                          value={culqiData.correo}
                          onChange={(e) => setCulqiData({ ...culqiData, correo: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan"
                        />
                        <input
                          type="text"
                          placeholder="DNI"
                          value={culqiData.dni}
                          onChange={(e) => setCulqiData({ ...culqiData, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan"
                        />
                        <input
                          type="tel"
                          placeholder="Celular"
                          value={culqiData.celular}
                          onChange={(e) => setCulqiData({ ...culqiData, celular: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!culqiData.correo || !culqiData.dni) {
                              toast.error('Completa correo y DNI');
                              return;
                            }
                            simulatePayment();
                          }}
                          disabled={loading}
                          className="w-full bg-yamboly-purple text-white py-2 rounded-lg font-semibold text-sm hover:bg-yamboly-purple/90 disabled:opacity-50"
                        >
                          {loading ? 'Procesando...' : 'Pagar con Culqi'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {formData.metodo_pago === 'contraentrega' && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-yamboly-purple font-semibold">Pagarás al recibir tu pedido</p>
                    <p className="text-xs text-gray-500 mt-1">No hay costo adicional por este método</p>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
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
                    <p className="text-xs text-emerald-700">Confirma que toda la información sea correcta.</p>
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
                    <p className="text-xs text-yamboly-purpleLight capitalize font-semibold">
                      {PAYMENT_METHODS.find((m) => m.id === formData.metodo_pago)?.label || formData.metodo_pago}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 shadow-sm">
                  <h4 className="font-baloo text-sm font-bold text-yamboly-purple mb-3">Productos Solicitados</h4>
                  <div className="space-y-2 mb-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-yamboly-purple/80">
                        <span>{item.cantidad}x {item.nombre}</span>
                        <span>S/ {safePrice(item.precio_unitario * item.cantidad)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200/50 pt-3 font-extrabold text-sm text-yamboly-purple flex justify-between">
                    <span>Total Final</span>
                    <span>S/ {safePrice(total)}</span>
                  </div>
                </div>

                {loading && (
                  <div className="bg-yamboly-purple/5 border border-yamboly-purple/10 rounded-xl p-4 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-yamboly-purple border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-sm font-semibold text-yamboly-purple">{loadingMessage}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 border border-yamboly-purpleLight/30 text-yamboly-purple py-3 rounded-xl hover:bg-yamboly-cyanLight/10 font-bold transition-all text-sm transform active:scale-95 disabled:opacity-50"
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

          {step === 3 && (
            <div className="lg:w-72 shrink-0">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:sticky lg:top-24">
                <h3 className="font-baloo text-lg font-bold text-yamboly-purple mb-4">Resumen</h3>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-yamboly-purple/70 truncate">{item.cantidad}x {item.nombre}</span>
                      <span className="font-semibold text-yamboly-purple">S/ {safePrice(item.precio_unitario * item.cantidad)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-yamboly-purple/70">Subtotal</span>
                    <span className="text-yamboly-purple">S/ {safePrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yamboly-purple/70">Envío</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-yamboly-purple border-t border-gray-200 pt-2 mt-2">
                    <span>Total</span>
                    <span>S/ {safePrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
