import { useState, useEffect } from 'react';

const SABORES = ['Chocolate', 'Vainilla', 'Lúcuma', 'Fresa', 'Chicha Morada'];
const ORDEN_OPCIONES = [
  { value: 'created_at_desc', label: 'Relevancia' },
  { value: 'precio_venta_asc', label: 'Precio ↑' },
  { value: 'precio_venta_desc', label: 'Precio ↓' },
  { value: 'nombre_asc', label: 'A-Z' },
];

export const FilterPanel = ({ categorias, filters, onFilterChange, isMobile, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showAllCats, setShowAllCats] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const update = (key, value) => {
    const next = { ...localFilters, [key]: value };
    setLocalFilters(next);
    if (!isMobile) {
      onFilterChange(next);
    }
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    if (onClose) onClose();
  };

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-yamboly-purple mb-2">Ordenar por</h3>
        <select
          value={localFilters.sort || 'created_at_desc'}
          onChange={(e) => update('sort', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yamboly-cyan"
        >
          {ORDEN_OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-yamboly-purple mb-2">Categoría</h3>
        <div className="space-y-2">
          {(showAllCats ? categorias : categorias.slice(0, 5)).map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={(localFilters.categoria_ids || []).includes(cat.id)}
                onChange={(e) => {
                  const current = localFilters.categoria_ids || [];
                  const next = e.target.checked
                    ? [...current, cat.id]
                    : current.filter((id) => id !== cat.id);
                  update('categoria_ids', next);
                }}
                className="accent-yamboly-cyan w-4 h-4"
              />
              {cat.nombre}
            </label>
          ))}
        </div>
        {categorias.length > 5 && !showAllCats && (
          <button
            onClick={() => setShowAllCats(true)}
            className="text-xs text-yamboly-cyan font-semibold mt-1 hover:underline"
          >
            + Ver más ({categorias.length - 5})
          </button>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-yamboly-purple mb-2">Precio</h3>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={localFilters.minPrice || 0}
            onChange={(e) => update('minPrice', Number(e.target.value))}
            className="w-full accent-yamboly-cyan"
          />
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={localFilters.maxPrice || 50}
            onChange={(e) => update('maxPrice', Number(e.target.value))}
            className="w-full accent-yamboly-cyan"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>S/ {localFilters.minPrice || 0}</span>
            <span>S/ {localFilters.maxPrice || 50}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-yamboly-purple mb-2">Disponibilidad</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={localFilters.inStock || false}
            onChange={(e) => update('inStock', e.target.checked)}
            className="accent-yamboly-cyan w-4 h-4"
          />
          Solo en stock
        </label>
      </div>

      <div>
        <h3 className="font-semibold text-yamboly-purple mb-2">Sabor</h3>
        <div className="flex flex-wrap gap-2">
          {SABORES.map((sabor) => (
            <button
              key={sabor}
              onClick={() => {
                const current = localFilters.sabores || [];
                const next = current.includes(sabor)
                  ? current.filter((s) => s !== sabor)
                  : [...current, sabor];
                update('sabores', next);
              }}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                (localFilters.sabores || []).includes(sabor)
                  ? 'bg-yamboly-cyan text-white border-yamboly-cyan'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-yamboly-cyan'
              }`}
            >
              {sabor}
            </button>
          ))}
        </div>
      </div>

      {isMobile && (
        <button
          onClick={handleApply}
          className="w-full bg-yamboly-cyan text-white py-2 rounded-lg font-semibold"
        >
          Aplicar filtros
        </button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
        <div
          className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-yamboly-purple">Filtros</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
};
