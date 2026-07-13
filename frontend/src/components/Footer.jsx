import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-yamboly-purple text-white pt-12 pb-6 mt-16">
      {/* Badges de Confianza */}
      <div className="container mx-auto px-4 mb-10 border-b border-white/10 pb-8">
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-x-visible md:pb-0">
          {[
            { icon: '🇵🇪', text: 'Helados 100% Peruanos' },
            { icon: '🔒', text: 'Compra 100% Segura SSL' },
            { icon: '✅', text: 'Inocuidad Certificada (HACCP)' },
            { icon: '🚚', text: 'Distribución en 7 Ciudades' },
          ].map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/10 border border-white/5 p-3.5 rounded-xl shrink-0 min-w-[240px] md:min-w-0 transition-transform duration-300 hover:scale-[1.03] shadow-sm"
            >
              <span className="text-2xl select-none">{b.icon}</span>
              <span className="text-xs font-extrabold tracking-wide text-white/90 leading-tight">{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Columna 1: Logo & Eslogan */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="Yámboly Logo" className="h-10 w-auto bg-white rounded p-1" />
            <span className="font-baloo text-2xl font-bold tracking-wide">Yámboly</span>
          </div>
          <p className="text-sm text-gray-300 max-w-xs">
            Helados 100% peruanos. Sabor y diversión para compartir en todo el Perú con la mejor calidad y tradición.
          </p>
        </div>

        {/* Columna 2: Categorías */}
        <div className="flex flex-col items-center text-center">
          <h4 className="font-baloo text-lg font-bold mb-4 text-yamboly-cyanLight">Nuestras Líneas</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/?category=Personal" className="hover:text-yamboly-magenta transition">Helados Personales</Link></li>
            <li><Link to="/?category=Familiar" className="hover:text-yamboly-magenta transition">Línea Familiar</Link></li>
            <li><Link to="/?category=Especiales" className="hover:text-yamboly-magenta transition">Edición Especial</Link></li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <h4 className="font-baloo text-lg font-bold mb-4 text-yamboly-cyanLight">Atención al Cliente</h4>
          <p className="text-sm text-gray-300 mb-1">ventas@yamboly.com</p>
          <p className="text-sm text-gray-300 mb-4">(01) 456-7890</p>
          <p className="text-xs text-gray-400">
            Av. Los Helados 123, Lima - Perú
          </p>
        </div>
      </div>

      <div className="border-t border-yamboly-purpleLight/40 pt-6 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Helados Yámboly. Todos los derechos reservados. MVP e-business.</p>
      </div>
    </footer>
  );
};
