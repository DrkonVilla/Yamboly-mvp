import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { CartIcon } from './CartIcon';
import { HomeIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50 transition-all">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Yámboly Logo" className="h-9 w-auto transition-transform group-hover:scale-105" />
          <span className="font-baloo text-2xl font-extrabold tracking-wide text-yamboly-purple group-hover:text-yamboly-magenta transition-colors">
            Yámboly
          </span>
        </Link>

        {/* Enlaces centrales (solo en desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-yamboly-purple hover:text-yamboly-magenta font-semibold transition-colors flex items-center gap-1">
            <HomeIcon className="h-5 w-5 text-yamboly-purpleLight" /> Tienda
          </Link>
          <Link to="/nosotros" className="text-yamboly-purple hover:text-yamboly-magenta font-semibold transition-colors">
            Nosotros
          </Link>
          {user?.rol === 'admin' && (
            <Link to="/admin" className="text-yamboly-purple hover:text-yamboly-magenta font-semibold transition-colors">
              Panel Admin
            </Link>
          )}
        </div>

        {/* Acciones derecha */}
        <div className="flex items-center gap-4">
          {/* Carrito */}
          <Link to="/cart" className="relative group p-1 rounded-full hover:bg-yamboly-cyanLight/10 transition-colors">
            <CartIcon className="text-yamboly-purple hover:text-yamboly-magenta transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yamboly-magenta text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Usuario / Login */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-yamboly-purple hidden md:inline">
                {user.nombre} {user.apellido}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-yamboly-magenta flex items-center gap-1 text-sm p-1 rounded-full hover:bg-red-50 transition-colors"
                title="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <Link to="/login" className="text-sm text-yamboly-magenta font-bold hover:text-yamboly-magenta/80 transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/register" className="text-sm text-yamboly-purple hover:text-yamboly-magenta font-bold transition-colors">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};