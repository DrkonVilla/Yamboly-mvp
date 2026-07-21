import { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon,
  TruckIcon,
  ArchiveBoxIcon,
  TagIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const adminMenuItems = [
  { path: '/admin', label: 'Dashboard', icon: ChartBarIcon, roles: ['admin'] },
  { path: '/admin/products', label: 'Productos Finales', icon: ShoppingBagIcon, roles: ['admin', 'ejecutivo'] },
  { path: '/admin/categories', label: 'Categorías / Líneas', icon: TagIcon, roles: ['admin', 'ejecutivo'] },
  { path: '/admin/orders', label: 'Ventas (Clientes B2C)', icon: ClipboardDocumentListIcon, roles: ['admin'] },
  { path: '/admin/purchase-orders', label: 'Compras (Proveedores B2B)', icon: TruckIcon, roles: ['admin', 'ejecutivo'] },
  { path: '/admin/stock', label: 'Kardex / Stock', icon: ArchiveBoxIcon, roles: ['admin', 'ejecutivo'] },
  { path: '/admin/reports', label: 'Reportes y Analíticas', icon: DocumentTextIcon, roles: ['admin'] },
  { path: '/admin/suppliers', label: 'Directorio Proveedores', icon: BuildingOffice2Icon, roles: ['admin', 'ejecutivo'] },
  { path: '/admin/supplies', label: 'Insumos / Materias', icon: CubeIcon, roles: ['admin', 'ejecutivo'] },
  { path: '/admin/customers', label: 'Clientes (CRM)', icon: UsersIcon, roles: ['admin'] },
  { path: '/admin/settings', label: 'Ajustes Globales', icon: WrenchScrewdriverIcon, roles: ['admin'] },
];

const providerMenuItems = [
  { path: '/provider', label: 'Panel Proveedor', icon: ChartBarIcon },
  { path: '/provider/orders', label: 'Mis Órdenes', icon: ClipboardDocumentListIcon },
];

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.rol !== 'admin' && user.rol !== 'proveedor' && user.rol !== 'ejecutivo') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || (user.rol !== 'admin' && user.rol !== 'proveedor' && user.rol !== 'ejecutivo')) {
    return null;
  }

  const isProvider = user.rol === 'proveedor';
  const menuItems = isProvider ? providerMenuItems : adminMenuItems.filter(item => item.roles?.includes(user.rol));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] text-slate-800 font-sans selection:bg-yamboly-cyan selection:text-white">
      {/* Sidebar - Fixed width, absolute height, internal scrollable area */}
      <aside className="w-[280px] h-screen flex flex-col bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 shrink-0 relative overflow-hidden">
        
        {/* Decoración superior sutil */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yamboly-cyan via-yamboly-magenta to-yamboly-yellow"></div>

        {/* Header / Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-slate-50/80">
          <Link to="/" className="flex flex-col gap-1 group block">
            <h1 className="font-baloo text-3xl font-extrabold text-slate-800 tracking-tight group-hover:text-yamboly-magenta transition-colors">
              Yámboly<span className="text-yamboly-cyan">.</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {isProvider ? 'Portal Proveedores' : 'Control Center'}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation - Area scrolleable flex-1 min-h-0 */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
          <p className="px-3 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menú Principal</p>
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            if (item.disabled) {
              return (
                <div key={item.path} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 opacity-60 cursor-not-allowed group relative">
                  <item.icon className="h-5 w-5 stroke-[2]" />
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="absolute right-3 text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded-full uppercase">Próximamente</span>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group
                  ${isActive 
                    ? 'bg-yamboly-purple text-white shadow-md shadow-yamboly-purple/20' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-yamboly-purple'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 stroke-[2] transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-yamboly-purple'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className="w-1 h-4 bg-white rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar - Botón cerrar sesión siempre visible */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yamboly-cyan to-yamboly-magenta flex items-center justify-center text-white font-bold shadow-inner">
                {user?.nombre?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.nombre} {user?.apellido}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">{user?.rol}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 stroke-[2]" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content - Area que scrollea independientemente */}
      <main className="flex-1 h-screen min-w-0 overflow-y-auto relative bg-[#f8fafc] scroll-smooth">
        {/* Glow effect sutil de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yamboly-cyan/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yamboly-magenta/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto pb-24">
          <Outlet />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #94a3b8;
        }
      `}} />
    </div>
  );
};