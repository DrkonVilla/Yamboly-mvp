import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { EnvelopeIcon, LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [animate, setAnimate] = useState(false);

  const redirect = location.state?.from || '/';

  useEffect(() => {
    // Trigger fade-in animation shortly after mount
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false);
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('¡Bienvenido a Yámboly!');
      navigate(redirect);
    } else {
      setErrorMessage(result.message || 'Credenciales inválidas. Por favor intenta de nuevo.');
      toast.error('Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Lado Izquierdo: Formulario */}
      <div 
        className={`w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 transition-all duration-700 transform ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="mx-auto w-full max-w-md">
          {/* Logo Yámboly */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="font-baloo text-4xl font-black tracking-tight text-yamboly-purple flex items-center justify-center lg:justify-start gap-1">
              Yámboly<span className="text-yamboly-cyan">.</span>
            </h1>
            <p className="text-xs font-bold text-yamboly-purpleLight/60 uppercase tracking-widest mt-1">
              Heladería Artesanal
            </p>
          </div>

          <h2 className="text-2xl font-extrabold text-yamboly-purple tracking-tight mb-2 text-center lg:text-left">
            ¡Hola de nuevo!
          </h2>
          <p className="text-sm text-yamboly-purpleLight mb-8 text-center lg:text-left">
            Ingresa tus credenciales para acceder a tu cuenta.
          </p>

          {/* Alerta de Error Inline */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 animate-shake">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />
              <div className="text-xs font-semibold leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yamboly.com"
                  className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan/35 focus:border-yamboly-cyan text-yamboly-purple transition-all placeholder:text-gray-300"
                />
                <EnvelopeIcon className="h-5 w-5 text-gray-450 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider">
                  Contraseña
                </label>
                <a href="#forgot" className="text-xs font-bold text-yamboly-cyan hover:underline transition-all">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan/35 focus:border-yamboly-cyan text-yamboly-purple transition-all placeholder:text-gray-300"
                />
                <LockClosedIcon className="h-5 w-5 text-gray-450 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-yamboly-cyan hover:bg-yamboly-cyan/95 hover:shadow-lg hover:shadow-yamboly-cyan/20 text-white py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all transform active:scale-98 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Enlaces de registro */}
          <div className="text-center mt-8 space-y-4">
            <p className="text-sm text-yamboly-purpleLight font-medium">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-yamboly-cyan hover:text-yamboly-cyan/80 font-bold hover:underline transition-all">
                Regístrate
              </Link>
            </p>
            
            {/* Demo Helpers Card */}
            <div className="p-3.5 bg-gray-50 border border-gray-150 rounded-2xl text-left">
              <span className="text-[10px] font-extrabold text-yamboly-cyan uppercase tracking-wider block mb-1">
                Credenciales de Prueba (Demo)
              </span >
              <p className="text-xs text-yamboly-purpleLight font-medium">
                • <strong>Admin</strong>: admin@yamboly.com / Admin2026!<br />
                • <strong>Cliente</strong>: cliente1@mail.com / password123
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Imagen de Fondo con Tagline */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative items-center justify-center"
        style={{ backgroundImage: `url('/yamboly_login_bg.png')` }}
      >
        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yamboly-purple/90 via-yamboly-purple/75 to-yamboly-cyan/50 backdrop-blur-[1px]"></div>
        
        {/* Contenido flotante */}
        <div className="relative text-center px-12 text-white max-w-lg space-y-4 animate-fade-in">
          <h2 className="font-baloo text-5xl font-black leading-tight drop-shadow-md">
            Yámboly
          </h2>
          <p className="text-lg font-medium text-gray-100 drop-shadow-sm">
            Los mejores helados artesanales, directo a tu puerta.
          </p>
          <div className="w-16 h-1 bg-yamboly-cyan mx-auto rounded-full mt-6"></div>
        </div>
      </div>
    </div>
  );
};