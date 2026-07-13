import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CreditCard3D } from '../components/CreditCard3D';
import { enviarConfirmacionCompra } from '../utils/emailService';

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

const isExpiryValid = (expiry) => {
  if (expiry.length !== 5) return false;
  const [mmStr, yyStr] = expiry.split('/');
  const mm = parseInt(mmStr, 10);
  const yy = parseInt(yyStr, 10);
  if (isNaN(mm) || isNaN(yy) || mm < 1 || mm > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
};

const PAYMENT_METHODS = [
  { id: 'visa', label: 'Visa' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'yape', label: 'Yape' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'contraentrega', label: 'Contraentrega' },
];

const renderPaymentMethodIcon = (methodId, isSelected) => {
  const color = isSelected ? 'ffffff' : '4B2E83';
  switch (methodId) {
    case 'visa':
      return <img src={`https://cdn.simpleicons.org/visa/${color}`} alt="Visa" className="h-5 w-auto object-contain" />;
    case 'mastercard':
      return <img src={`https://cdn.simpleicons.org/mastercard/${color}`} alt="Mastercard" className="h-5 w-auto object-contain" />;
    case 'paypal':
      return <img src={`https://cdn.simpleicons.org/paypal/${color}`} alt="PayPal" className="h-5 w-auto object-contain" />;
    case 'yape':
      return (
        <div className="flex items-center gap-1.5">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={isSelected ? '#ffffff' : '#742384'} />
            <path d="M8 8L12 13L16 8" stroke={isSelected ? '#742384' : '#00D2C4'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 13V18" stroke={isSelected ? '#742384' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={`text-xs font-black tracking-tighter ${isSelected ? 'text-white' : 'text-[#742384]'}`}>yape</span>
        </div>
      );
    case 'contraentrega':
      return (
        <svg className="w-5 h-5" fill="none" stroke={isSelected ? '#ffffff' : '#4B2E83'} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
          <path d="M2 10H22M12 13.5V15.5M9.5 14.5H14.5" stroke={isSelected ? '#ffffff' : '#4B2E83'} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotal, getCartItemsForApi, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const total = getTotal();

  useEffect(() => {
    const validateCart = async () => {
      if (items.length === 0) return;
      try {
        const response = await api.get('/products', { params: { limit: 100 } });
        if (response.data.success) {
          const dbProducts = response.data.data;
          const validIds = new Set(dbProducts.map(p => p.id));
          const hasInvalidItems = items.some(item => !validIds.has(item.producto_id));
          if (hasInvalidItems) {
            toast.error("Detectamos productos antiguos no válidos en tu carrito. Limpiando...");
            clearCart();
            navigate('/');
          }
        }
      } catch (err) {
        console.error("Error al validar productos del carrito:", err);
      }
    };
    validateCart();
  }, [items, clearCart, navigate]);

  const [step, setStep] = useState(1);
  const [canalDemo, setCanalDemo] = useState('web');
  const [formData, setFormData] = useState({
    direccion: '',
    ciudad: 'Lima',
    departamento: 'Lima',
    telefono: '',
    metodo_pago: 'tarjeta',
  });
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
  const [cvvFocused, setCvvFocused] = useState(false);
  const [selectedSubMethod, setSelectedSubMethod] = useState('visa');
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
    
    let msg1 = 'Verificando con el banco...';
    let msg2 = 'Procesando transacción...';
    let msg3 = '¡Pago aprobado!';
    
    if (formData.metodo_pago === 'yape') {
      msg1 = 'Verificando transferencia Yape...';
      msg2 = 'Confirmando con la billetera...';
      msg3 = '¡Yape recibido exitosamente!';
    } else if (formData.metodo_pago === 'paypal') {
      msg1 = 'Conectando con PayPal...';
      msg2 = 'Autorizando transacción...';
      msg3 = '¡PayPal aprobado!';
    } else if (formData.metodo_pago === 'contraentrega') {
      msg1 = 'Registrando pedido contraentrega...';
      msg2 = 'Generando orden de entrega...';
      msg3 = '¡Pedido registrado!';
    }
    
    setLoadingMessage(msg1);
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingMessage(msg2);
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

    setLoadingMessage(msg3);
    await new Promise((r) => setTimeout(r, 800));

    try {
      const payload = {
        items: getCartItemsForApi(),
        direccion_envio: `${formData.direccion}, ${formData.ciudad}, ${formData.departamento}`,
        metodo_pago: formData.metodo_pago,
        canal: canalDemo,
      };
      const response = await api.post('/orders', payload);
      if (response.data.success) {
        toast.success('¡Pago exitoso!');
        // Fire-and-forget: no await — nunca bloquea la navegación
        enviarConfirmacionCompra(response.data.data, user);
        clearCart();
        navigate(`/order-confirmation/${response.data.data.id}`);
      }
    } catch (error) {
      toast.error('Error al crear la orden');
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleCardNumberChange = (value) => {
    const formatted = formatCardNumber(value);
    const firstDigit = formatted.replace(/\s/g, '')[0];
    if (firstDigit === '4') {
      setSelectedSubMethod('visa');
    } else if (firstDigit === '5') {
      setSelectedSubMethod('mastercard');
    }
    setCardData({ ...cardData, number: formatted });
  };

  const handlePaymentMethodSelect = (methodId) => {
    if (methodId === 'visa') {
      setFormData({ ...formData, metodo_pago: 'tarjeta' });
      setSelectedSubMethod('visa');
      if (!cardData.number.startsWith('4')) {
        setCardData({ ...cardData, number: '4' });
      }
    } else if (methodId === 'mastercard') {
      setFormData({ ...formData, metodo_pago: 'tarjeta' });
      setSelectedSubMethod('mastercard');
      if (!cardData.number.startsWith('5')) {
        setCardData({ ...cardData, number: '5' });
      }
    } else {
      setFormData({ ...formData, metodo_pago: methodId });
      setSelectedSubMethod(methodId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.metodo_pago === 'tarjeta') {
      if (!isValidLuhn(cardData.number)) {
        toast.error('Número de tarjeta inválido');
        return;
      }
      if (!isExpiryValid(cardData.expiry)) {
        toast.error('La tarjeta está vencida o es inválida');
        return;
      }
      if (cardData.cvv.length < 3) {
        toast.error('CVV inválido');
        return;
      }
    }

    simulatePayment();
  };

  const cleanCardNumber = cardData.number.replace(/\s/g, '');
  const cardNumberValid = cleanCardNumber.length === 16 && isValidLuhn(cleanCardNumber);
  const cardNumberError = cleanCardNumber.length === 16 && !isValidLuhn(cleanCardNumber);
  const expiryValid = cardData.expiry.length === 5 && isExpiryValid(cardData.expiry);
  const expiryError = cardData.expiry.length === 5 && !isExpiryValid(cardData.expiry);
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
                
                <div className="p-3.5 border-2 border-dashed border-yamboly-cyan/50 rounded-xl bg-yamboly-cyanLight/5 mt-4">
                  <div className="flex items-center gap-1.5 mb-1.5 text-yamboly-cyan">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Canal de venta (modo demo)</span>
                  </div>
                  <select
                    value={canalDemo}
                    onChange={(e) => setCanalDemo(e.target.value)}
                    className="w-full border border-yamboly-cyan/30 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple bg-white font-semibold"
                  >
                    <option value="web">🌐 Web (E-commerce oficial)</option>
                    <option value="rappi">🛵 Rappi (Delivery rápido)</option>
                    <option value="tottus">🏪 Tottus (Supermercado)</option>
                    <option value="tambo">🏪 Tambo (Tienda de conveniencia)</option>
                    <option value="tiktok">🎵 TikTok Shop (Venta directa)</option>
                  </select>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-3">
                    Selecciona un Método de Pago
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = (method.id === 'visa' || method.id === 'mastercard')
                        ? (formData.metodo_pago === 'tarjeta' && selectedSubMethod === method.id)
                        : (formData.metodo_pago === method.id);

                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => handlePaymentMethodSelect(method.id)}
                          className={`flex flex-col items-center justify-between p-4 h-24 border-2 rounded-2xl cursor-pointer transition-all transform active:scale-95 text-center ${
                            isSelected
                              ? 'bg-gradient-to-br from-yamboly-purple to-yamboly-cyanLight text-white border-transparent shadow-md font-bold'
                              : 'bg-white text-yamboly-purple border-gray-200 hover:border-yamboly-cyanLight/60 hover:bg-slate-50/50 font-bold'
                          }`}
                        >
                          <div className="flex-1 flex items-center justify-center">
                            {renderPaymentMethodIcon(method.id, isSelected)}
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider mt-1">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.metodo_pago === 'tarjeta' && (
                  <div className="space-y-4">
                    <CreditCard3D
                      number={cardData.number}
                      name={user?.nombre || ''}
                      expiry={cardData.expiry}
                      cvv={cardData.cvv}
                      isFlipped={cvvFocused}
                    />
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 mb-1.5">Número de tarjeta</label>
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="**** **** **** ****"
                          maxLength={19}
                          className={`w-full pr-10 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                            cardNumberError ? 'border-red-400 focus:ring-red-400' : cardNumberValid ? 'border-green-400 focus:ring-green-400' : 'border-yamboly-purpleLight/30 focus:ring-yamboly-cyan'
                          } text-yamboly-purple font-mono`}
                        />
                        {cardNumberValid && (
                          <span className="absolute right-3 top-[36px] text-emerald-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                        {cardNumberError && (
                          <span className="absolute right-3 top-[38px] flex items-center gap-1 text-red-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-[10px] font-bold">Inválido</span>
                          </span>
                        )}
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
                            className={`w-full pr-10 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                              expiryError ? 'border-red-400 focus:ring-red-400' : expiryValid ? 'border-green-400 focus:ring-green-400' : 'border-yamboly-purpleLight/30 focus:ring-yamboly-cyan'
                            } text-yamboly-purple font-mono`}
                          />
                          {expiryValid && (
                            <span className="absolute right-3 top-[36px] text-emerald-500">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                          {expiryError && (
                            <span className="absolute right-3 top-[38px] flex items-center gap-1 text-red-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="text-[10px] font-bold">Vencido</span>
                            </span>
                          )}
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
                            className={`w-full pr-10 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                              cvvValid ? 'border-green-400 focus:ring-green-400' : 'border-yamboly-purpleLight/30 focus:ring-yamboly-cyan'
                            } text-yamboly-purple font-mono`}
                          />
                          {cvvValid && (
                            <span className="absolute right-3 top-[36px] text-emerald-500">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formData.metodo_pago === 'yape' && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <img src="/qr-yape.svg" alt="QR Yape" className="w-48 h-48 border-2 border-yamboly-cyan rounded-xl p-2 bg-white" />
                    <p className="text-sm text-yamboly-purple text-center">
                      1. Abre Yape en tu celular<br />
                      2. Escanea este código QR<br />
                      3. Confirma el pago
                    </p>
                  </div>
                )}

                {formData.metodo_pago === 'paypal' && (
                  <div className="flex flex-col items-center gap-4 py-4 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                    <img src="https://cdn.simpleicons.org/paypal/003087" alt="PayPal" className="h-12 object-contain" />
                    <p className="text-sm text-yamboly-purple text-center font-medium">Serás redirigido a PayPal para completar el pago de forma segura</p>
                    <p className="text-xs text-gray-400">Simulación: auto-aprobación al confirmar</p>
                  </div>
                )}

                {formData.metodo_pago === 'contraentrega' && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-yamboly-purple font-semibold">Pagarás al recibir tu pedido</p>
                    <p className="text-xs text-gray-500 mt-1">Recuerda tener el monto exacto listo en efectivo.</p>
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
                    onClick={() => {
                      if (formData.metodo_pago === 'tarjeta') {
                        if (!cardNumberValid) {
                          toast.error('Completa un número de tarjeta válido');
                          return;
                        }
                        if (!expiryValid) {
                          toast.error('Completa una fecha de expiración válida');
                          return;
                        }
                        if (!cvvValid) {
                          toast.error('Completa un código CVV válido');
                          return;
                        }
                      }
                      setStep(3);
                    }}
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
                  <svg className="w-6 h-6 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
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
                      {formData.metodo_pago === 'tarjeta'
                        ? `Tarjeta (${selectedSubMethod === 'visa' ? 'Visa' : 'Mastercard'})`
                        : PAYMENT_METHODS.find((m) => m.id === formData.metodo_pago)?.label || formData.metodo_pago}
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
        </div>
      </div>
    </div>
  );
};
