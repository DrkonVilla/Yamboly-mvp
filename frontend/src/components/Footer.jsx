import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-yamboly-purple text-white pt-16 pb-8 relative z-20">
      {/* Badges de Confianza - Estilo Clean */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {[
            { icon: '🇵🇪', text: 'Helados 100% Peruanos' },
            { icon: '🔒', text: 'Compra 100% Segura' },
            { icon: '✅', text: 'Inocuidad Certificada' },
            { icon: '🚚', text: 'Distribución Nacional' },
          ].map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm"
            >
              <span className="text-xl">{b.icon}</span>
              <span className="text-sm font-semibold tracking-wide text-white/90">{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Columna 1: Logo & Eslogan */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="mb-6 bg-white/10 p-3 rounded-2xl backdrop-blur-sm inline-block">
            <img src="/logo.png" alt="Yámboly Logo" className="h-12 w-auto brightness-0 invert drop-shadow-sm" />
          </div>
          <p className="text-sm text-white/80 max-w-xs font-medium leading-relaxed">
            Helados 100% peruanos. Sabor y diversión para compartir en todo el Perú con la mejor calidad y tradición.
          </p>
        </div>

        {/* Columna 2: Categorías */}
        <div className="flex flex-col items-center text-center">
          <h4 className="font-baloo text-xl font-bold mb-4 text-yamboly-cyanLight">Nuestras Líneas</h4>
          <ul className="space-y-3 text-sm font-medium text-white/90">
            <li><Link to="/?categoria=Personal" className="hover:text-yamboly-yellow transition-colors">Helados Personales</Link></li>
            <li><Link to="/?categoria=Familiar" className="hover:text-yamboly-yellow transition-colors">Línea Familiar</Link></li>
            <li><Link to="/?categoria=Especiales" className="hover:text-yamboly-yellow transition-colors">Edición Especial</Link></li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <h4 className="font-baloo text-xl font-bold mb-4 text-yamboly-cyanLight">Atención al Cliente</h4>
          <p className="text-sm font-medium text-white/90 mb-2 hover:text-yamboly-yellow transition-colors cursor-pointer flex items-center gap-2">
            ✉️ ventas@yamboly.com
          </p>
          <p className="text-sm font-medium text-white/90 mb-6 hover:text-yamboly-yellow transition-colors cursor-pointer flex items-center gap-2">
            📞 (01) 456-7890
          </p>
          <p className="text-xs font-medium text-white/60">
            Av. Los Helados 123, Lima - Perú
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 text-center text-xs font-medium text-white/50">
        <p>&copy; {new Date().getFullYear()} Helados Yámboly. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

