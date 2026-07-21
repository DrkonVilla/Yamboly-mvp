import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Cog6ToothIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const AdminSettings = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Convertimos el array de configs a un objeto para manejarlo fácil en el form
  const [formData, setFormData] = useState({});

  const fetchConfigs = async () => {
    try {
      const res = await api.get('/config');
      if (res.data.success) {
        setConfigs(res.data.data);
        const dataObj = {};
        res.data.data.forEach(c => {
          dataObj[c.clave] = c.valor;
        });
        setFormData(dataObj);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleChange = (clave, value) => {
    setFormData(prev => ({
      ...prev,
      [clave]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Guardar cada config modificada
      const promises = configs.map(c => {
        if (formData[c.clave] !== c.valor) {
          return api.put(`/config/${c.clave}`, { valor: formData[c.clave] });
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      toast.success('Configuraciones guardadas exitosamente');
      await fetchConfigs(); // recargar
    } catch (error) {
      toast.error('Error al guardar configuraciones');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-yamboly-cyan"></span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
          <Cog6ToothIcon className="h-8 w-8 stroke-[2]" />
        </div>
        <div>
          <h1 className="font-baloo text-4xl font-extrabold text-slate-800 tracking-tight">Ajustes Globales</h1>
          <p className="text-sm font-medium text-slate-500">
            Modifica las variables de negocio de Yámboly sin necesidad de tocar código.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card: Facturación y Ventas */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100">
          <h2 className="text-xl font-baloo font-bold text-slate-800 mb-6 flex items-center gap-2">
            Facturación y Ventas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Impuesto IGV (%)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData['TAX_RATE'] || ''}
                onChange={(e) => handleChange('TAX_RATE', e.target.value)}
                className="w-full border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-yamboly-cyan focus:ring-yamboly-cyan/20 transition-colors"
                placeholder="Ej. 18"
              />
              <p className="text-[11px] text-slate-400 mt-1">Porcentaje de impuesto cobrado a clientes finales.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Costo de Delivery Estándar (S/)
              </label>
              <input
                type="number"
                step="0.10"
                required
                value={formData['DELIVERY_COST'] || ''}
                onChange={(e) => handleChange('DELIVERY_COST', e.target.value)}
                className="w-full border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-yamboly-cyan focus:ring-yamboly-cyan/20 transition-colors"
                placeholder="Ej. 10.00"
              />
              <p className="text-[11px] text-slate-400 mt-1">Costo base de envío en el carrito.</p>
            </div>
          </div>
        </div>

        {/* Card: Contacto de Empresa */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100">
          <h2 className="text-xl font-baloo font-bold text-slate-800 mb-6 flex items-center gap-2">
            Contacto de Empresa
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Correo Electrónico Principal
              </label>
              <input
                type="email"
                required
                value={formData['CONTACT_EMAIL'] || ''}
                onChange={(e) => handleChange('CONTACT_EMAIL', e.target.value)}
                className="w-full border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-yamboly-cyan focus:ring-yamboly-cyan/20 transition-colors"
                placeholder="Ej. ventas@yamboly.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Teléfono
              </label>
              <input
                type="text"
                required
                value={formData['CONTACT_PHONE'] || ''}
                onChange={(e) => handleChange('CONTACT_PHONE', e.target.value)}
                className="w-full border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-yamboly-cyan focus:ring-yamboly-cyan/20 transition-colors"
                placeholder="Ej. +51 999 888 777"
              />
            </div>
          </div>
        </div>

        {/* Floating Save Button Area */}
        <div className="flex justify-end pt-4 pb-12">
          <button
            type="submit"
            disabled={saving}
            className="bg-yamboly-cyan hover:bg-[#0090c7] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(0,163,224,0.3)] hover:shadow-[0_6px_20px_rgba(0,163,224,0.4)] transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            {saving ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
            ) : (
              <CheckIcon className="h-5 w-5 stroke-[3]" />
            )}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};
