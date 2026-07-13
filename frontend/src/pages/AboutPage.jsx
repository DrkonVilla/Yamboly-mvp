import { Link } from 'react-router-dom';
import { WaveDivider } from '../components/WaveDivider';
import { Footer } from '../components/Footer';

export const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <div>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-yamboly-cyan to-yamboly-cyanLight pt-16 pb-24 text-white overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="bg-yamboly-yellow text-yamboly-purple text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              ✨ Tradición y Familia
            </span>
            <h1 className="font-baloo text-4xl md:text-5xl font-extrabold tracking-wide mt-4 mb-3 drop-shadow-md text-yamboly-purple leading-tight">
              Nuestra Historia
            </h1>
            <p className="text-sm md:text-base text-yamboly-purple font-medium opacity-90 max-w-xl mx-auto">
              Conoce la pasión y el emprendimiento peruano detrás de cada uno de nuestros helados.
            </p>
          </div>
          <WaveDivider fill="fill-[#FAF9F6]" className="absolute bottom-0 left-0 w-full" />
        </div>

        {/* Narrative & Founder section */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="font-baloo text-2xl font-bold text-yamboly-purple mb-4">
                El Sueño de Dora Rodríguez
              </h2>
              <p className="text-sm text-yamboly-purpleLight/90 leading-relaxed mb-4">
                La historia de Yámboly es la historia de Dora Rodríguez, una incansable emprendedora de raíces ayacuchanas que decidió transformar el mercado peruano de helados. Con una visión centrada en el valor de la familia y el sabor auténtico, inició un camino de esfuerzo y perseverancia.
              </p>
              <p className="text-sm text-yamboly-purpleLight/90 leading-relaxed">
                Su historia de superación comenzó con producciones artesanales locales, donde cada receta se preparaba pensando en compartir alegría. Con los años, esa pasión se formalizó, dando origen a la empresa en el distrito de San Juan de Lurigancho en Lima, desde donde se impulsó una de las marcas con mayor identidad del país.
              </p>
            </div>
            <div className="w-48 h-48 md:w-56 md:h-56 bg-yamboly-cyanLight/25 rounded-full flex items-center justify-center p-4 border border-yamboly-cyan/20">
              <span className="text-8xl">👩‍🍳</span>
            </div>
          </div>

          {/* Blockquote Quote */}
          <div className="text-center max-w-2xl mx-auto mb-16 px-4">
            <span className="text-4xl text-yamboly-magenta block mb-3 font-baloo">“</span>
            <blockquote className="text-lg md:text-xl font-extrabold text-yamboly-purple italic leading-relaxed">
              La visión de Yámboly es llevar momentos de dulzura y diversión a cada rincón del Perú, uniendo a las familias con la frescura de nuestra tradición heladera.
            </blockquote>
            <p className="text-xs font-bold uppercase tracking-wider text-yamboly-cyan mt-3">— Inspiración Yámboly</p>
          </div>

          {/* Timeline of Milestones */}
          <div className="mb-16">
            <h3 className="font-baloo text-2xl font-bold text-yamboly-purple text-center mb-10">
              Hitos de Nuestro Camino
            </h3>

            <div className="relative border-l-2 border-yamboly-cyan/30 ml-4 md:ml-32 space-y-8">
              {[
                {
                  year: 'Orígenes',
                  title: 'Pasión en Quillabamba, Cusco',
                  desc: 'Dora Rodríguez inicia las primeras recetas caseras de helados, deleitando a la comunidad con sabores naturales y locales.',
                  icon: '🏔️',
                },
                {
                  year: 'Consolidación',
                  title: 'Fundación de Helatony\'s SAC',
                  desc: 'Se formalizan las operaciones estableciendo la planta principal en San Juan de Lurigancho, Lima, escalando la producción con tecnología moderna.',
                  icon: '🏭',
                },
                {
                  year: 'Crecimiento',
                  title: 'Expansión Nacional',
                  desc: 'Logramos establecer una red logística propia distribuyendo helados de calidad en 7 ciudades clave de todo el Perú.',
                  icon: '🚚',
                },
                {
                  year: 'Hoy',
                  title: 'Tercera Marca del País',
                  desc: 'Yámboly se consolida como la tercera marca de helados más grande y preferida por las familias peruanas en el mercado nacional.',
                  icon: '🏆',
                },
              ].map((milestone, idx) => (
                <div key={idx} className="relative pl-8 md:pl-12">
                  <div className="absolute -left-5 top-1.5 w-10 h-10 rounded-full bg-white border-2 border-yamboly-cyan flex items-center justify-center shadow-sm text-sm">
                    {milestone.icon}
                  </div>
                  <div>
                    <span className="inline-block bg-yamboly-magenta text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-1">
                      {milestone.year}
                    </span>
                    <h4 className="font-baloo text-base font-bold text-yamboly-purple">
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-yamboly-purpleLight mt-1 max-w-xl">
                      {milestone.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-yamboly-purple to-yamboly-purpleLight rounded-3xl p-8 text-center text-white shadow-md border border-white/5">
            <h3 className="font-baloo text-2xl font-bold mb-3">¡Prueba la Diversión Hoy Mismo!</h3>
            <p className="text-xs md:text-sm text-white/80 max-w-md mx-auto mb-6">
              Descubre nuestra amplia variedad de paletas, sándwiches y potes familiares con los mejores precios del mercado.
            </p>
            <Link
              to="/"
              className="inline-block bg-yamboly-magenta hover:bg-yamboly-magenta/90 text-white font-bold px-8 py-3 rounded-full shadow hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 text-sm"
            >
              Ver Catálogo de Helados
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
