import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  
  // Filtros y paginación
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    ruc: '',
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    activo: true,
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers?includeInactive=true');
      if (res.data.success) {
        setSuppliers(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (supplier) => {
    if (!window.confirm(`¿Está seguro de desactivar al proveedor "${supplier.nombre}"?`)) return;
    try {
      await api.delete(`/suppliers/${supplier.id}`);
      toast.success('Proveedor desactivado con éxito');
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al desactivar proveedor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, formData);
        toast.success('Proveedor actualizado con éxito');
      } else {
        await api.post('/suppliers', formData);
        toast.success('Proveedor registrado con éxito');
      }
      setShowModal(false);
      setEditingSupplier(null);
      setFormData({ ruc: '', nombre: '', contacto: '', telefono: '', email: '', direccion: '', activo: true });
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      ruc: supplier.ruc,
      nombre: supplier.nombre,
      contacto: supplier.contacto,
      telefono: supplier.telefono,
      email: supplier.email,
      direccion: supplier.direccion,
      activo: supplier.activo,
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingSupplier(null);
    setFormData({
      ruc: '',
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      activo: true,
    });
    setShowModal(true);
  };

  // Filtrado
  const filteredSuppliers = suppliers.filter(s => 
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.ruc.includes(search)
  );

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-baloo text-2xl font-bold text-yamboly-purple">Gestión de Proveedores</h1>
          <p className="text-xs text-yamboly-purpleLight/70">Administra los proveedores de insumos para la heladería.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-yamboly-cyan hover:bg-yamboly-cyan/90 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm transition-all transform active:scale-95 shrink-0"
        >
          <PlusIcon className="h-5 w-5 stroke-[2.5]" /> Registrar Proveedor
        </button>
      </div>

      {/* Filtros de búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Buscar por nombre o RUC..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan focus:border-yamboly-cyan text-yamboly-purple"
          />
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
        </div>
        <div className="text-xs text-yamboly-purpleLight/60 font-semibold">
          Mostrando {filteredSuppliers.length} proveedores en total
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="inline-block w-8 h-8 border-4 border-yamboly-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-yamboly-purpleLight font-semibold">Cargando proveedores...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">RUC</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Nombre / Razón Social</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-yamboly-purple/60 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-yamboly-purpleLight">
                      No se encontraron proveedores que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-yamboly-purple font-medium">{s.ruc}</td>
                      <td className="px-6 py-4 text-sm font-bold text-yamboly-purple">{s.nombre}</td>
                      <td className="px-6 py-4 text-sm text-yamboly-purpleLight">{s.contacto}</td>
                      <td className="px-6 py-4 text-sm text-yamboly-purpleLight">{s.telefono}</td>
                      <td className="px-6 py-4 text-sm text-yamboly-purpleLight">{s.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                          s.activo ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {s.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                            title="Editar Proveedor"
                          >
                            <PencilIcon className="h-5 w-5 stroke-2" />
                          </button>
                          {s.activo && (
                            <button
                              onClick={() => handleDelete(s)}
                              className="p-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                              title="Desactivar Proveedor"
                            >
                              <TrashIcon className="h-5 w-5 stroke-2" />
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-yamboly-purple bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-xs text-yamboly-purpleLight font-semibold">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-yamboly-purple bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Modal Formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-yamboly-purple/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-baloo text-lg font-bold text-yamboly-purple">
                {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">RUC</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '') })}
                    placeholder="20123456789"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Nombre / Razón Social</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Distribuidora Helados"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Contacto Comercial</label>
                  <input
                    type="text"
                    required
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ej. 999 999 999"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="proveedor@empresa.com"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-yamboly-purple/70 uppercase tracking-wider mb-1">Dirección Fiscal</label>
                <input
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Av. Las Magnolias 123, Lima"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yamboly-cyan text-yamboly-purple"
                />
              </div>

              {editingSupplier && (
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 text-yamboly-cyan rounded border-gray-300 focus:ring-yamboly-cyan"
                  />
                  <label htmlFor="activo" className="text-xs font-bold uppercase tracking-wider text-yamboly-purple/70 cursor-pointer">
                    Proveedor Activo
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-yamboly-cyan hover:bg-yamboly-cyan/90 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Guardando...' : 'Guardar Proveedor'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-xl text-sm font-bold text-yamboly-purple hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
