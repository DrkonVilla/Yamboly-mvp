import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: ChartBarIcon },
  { path: '/admin/products', label: 'Productos', icon: ShoppingBagIcon },
  { path: '/admin/orders', label: 'Órdenes', icon: ClipboardDocumentListIcon },
  { path: '/admin/reports', label: 'Reportes', icon: DocumentTextIcon },
];

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.rol !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || user.rol !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-baloo text-2xl font-extrabold text-yamboly-purple">Yámboly</h1>
          <p className="text-xs text-yamboly-purpleLight font-medium">Panel de Administración</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yamboly-cyanLight/10 text-gray-600 hover:text-yamboly-purple font-medium transition-colors"
            >
              <item.icon className="h-5 w-5 text-yamboly-purpleLight" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.nombre?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 w-full px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};