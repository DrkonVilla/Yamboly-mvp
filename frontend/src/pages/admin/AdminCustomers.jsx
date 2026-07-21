import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contrasena: ''
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/users/clients');
      if (res.data.success) setCustomers(res.data.data);
    } catch (error) {
      console.error(error);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchCustomers(); 
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este cliente?')) return;
    try {
      await api.delete(`/users/clients/${id}`);
      toast.success('Cliente desactivado exitosamente');
      fetchCustomers();
    } catch (error) {
      toast.error('Error al desactivar el cliente');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/users/clients/${editingCustomer.id}`, formData);
        toast.success('Cliente actualizado exitosamente');
      } else {
        await api.post('/users/clients', formData);
        toast.success('Cliente creado exitosamente');
      }
      closeDrawer();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el cliente');
    }
  };

  const openEdit = (c) => {
    setEditingCustomer(c);
    setFormData({
      nombre: c.nombre || '',
      apellido: c.apellido || '',
      email: c.email || '',
      contrasena: ''
    });
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditingCustomer(null);
    setFormData({ nombre: '', apellido: '', email: '', contrasena: '' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-baloo text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Clientes B2C</h1>
          <p className="text-sm font-medium text-slate-500">
            Directorio de clientes registrados en la tienda y creación manual (antifallas).
          </p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="bg-yamboly-cyan hover:bg-[#0090c7] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(0,163,224,0.3)] hover:shadow-[0_6px_20px_rgba(0,163,224,0.4)] transition-all flex items-center justify-center gap-2 transform active:scale-95"
        >
          <PlusIcon className="h-5 w-5 stroke-[2]" />
          Nuevo Cliente
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-16">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Registro</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <span className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-yamboly-cyan"></span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                    No se encontraron clientes.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-400">#{c.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{c.nombre} {c.apellido}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 truncate">{c.email}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(c.created_at).toLocaleDateString('es-PE')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        c.activo 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5 stroke-[2]" />
                        </button>
                        {c.activo && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                            title="Desactivar"
                          >
                            <TrashIcon className="h-5 w-5 stroke-[2]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Overlay */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeDrawer}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-baloo font-bold text-slate-800">
                {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <XMarkIcon className="h-5 w-5 stroke-[2]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              <form id="customerForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-yamboly-cyan focus:ring-yamboly-cyan/20 transition-colors"
                      placeholder="Ej. Ana"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apellido</label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      className="w-full border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-yamboly-cyan focus:ring-yamboly-cyan/20 transition-colors"
                      placeholder="Ej. Pérez"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-yamboly-cyan focus:ring-yamboly-cyan/20 transition-colors"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Contraseña {editingCustomer && '(Dejar en blanco para mantener actual)'}
                  </label>
                  <input
                    type="password"
                    required={!editingCustomer}
                    value={formData.contrasena}
                    onChange={(e) => setFormData({...formData, contrasena: e.target.value})}
                    className="w-full border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-yamboly-cyan focus:ring-yamboly-cyan/20 transition-colors"
                    placeholder="********"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-200/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="customerForm"
                  className="flex-1 bg-yamboly-cyan hover:bg-[#0090c7] text-white px-4 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(0,163,224,0.3)] hover:shadow-[0_6px_20px_rgba(0,163,224,0.4)] transition-all"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
