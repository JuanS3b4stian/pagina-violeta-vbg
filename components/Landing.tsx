
import React from 'react';

const Landing: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-violet-600 to-purple-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'white'}} />
                <stop offset="100%" style={{stopColor:'transparent'}} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="relative px-8 py-16 md:py-24 text-center md:text-left md:flex items-center justify-between gap-12 max-w-6xl mx-auto">
          <div className="md:w-3/5 space-y-6">
            <span className="bg-violet-400/30 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Espacio Seguro y Confidencial</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              Tú no estás sola, <br/>nosotros te <span className="text-pink-300">escuchamos.</span>
            </h2>
            <p className="text-violet-100 text-lg md:text-xl font-light">
              Página Violeta es el canal oficial del Municipio de San Pedro de los Milagros para reportar y recibir acompañamiento en casos de Violencia Basada en Género y discriminación.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button 
                onClick={() => window.location.hash = '#report'}
                className="bg-white text-violet-700 hover:bg-pink-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Denunciar Ahora
              </button>
              <button 
                onClick={() => document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-all"
              >
                Saber más
              </button>
            </div>
          </div>
          <div className="hidden md:block md:w-2/5">
            <img 
              src="https://picsum.photos/seed/purple/500/500" 
              alt="Ilustración Equidad" 
              className="rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-8 border-white/20"
            />
          </div>
        </div>
      </section>

      {/* Info Blocks */}
      <section id="info" className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-violet-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">100% Confidencial</h3>
          <p className="text-gray-600 leading-relaxed">Toda información suministrada es tratada bajo estrictos protocolos de seguridad y reserva legal por profesionales especializados.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-violet-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Apoyo Integral</h3>
          <p className="text-gray-600 leading-relaxed">Acompañamiento jurídico, psicológico y social a través de la Coordinación de Equidad de Género y Despachos competentes.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-violet-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Ruta de Atención</h3>
          <p className="text-gray-600 leading-relaxed">Gestión articulada entre Comisarías, Inspecciones y Secretaría de Gobierno para una respuesta rápida y efectiva.</p>
        </div>
      </section>

      {/* Educational Section */}
      <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-violet-50">
        <h2 className="text-3xl font-bold text-violet-900 mb-10 text-center">Formación y Sensibilización</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-pink-600 flex items-center gap-2">
              <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
              ¿Qué es la VBG?
            </h4>
            <p className="text-gray-700 leading-relaxed">
              La Violencia Basada en Género (VBG) es cualquier acto dañino dirigido contra una persona debido a su género. Se basa en una desigualdad de poder y normas perjudiciales. Incluye la violencia física, sexual, psicológica y económica.
            </p>
            <ul className="space-y-3">
              {['Acoso en espacios públicos', 'Violencia en la pareja', 'Discriminación laboral', 'Violencia sexual'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-violet-600 flex items-center gap-2">
              <span className="w-2 h-8 bg-violet-500 rounded-full"></span>
              Diversidad LGBTIQ+
            </h4>
            <p className="text-gray-700 leading-relaxed">
              En San Pedro de los Milagros promovemos el respeto a la diversidad sexual y de género. La discriminación por orientación sexual o identidad de género es una vulneración de derechos fundamentales que debe ser reportada.
            </p>
            <div className="bg-violet-50 p-6 rounded-xl border border-violet-100 italic text-violet-800">
              "El respeto a la diferencia es la base de una sociedad en paz."
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
