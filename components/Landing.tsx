
import React from 'react';

const Landing: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero - Simplificado sin imagen */}
      <section className="relative bg-gradient-to-r from-violet-600 to-purple-700 rounded-[3rem] overflow-hidden shadow-2xl">
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
        <div className="relative px-8 py-20 md:py-32 text-center max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center">
            <span className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-white/10">
              Espacio Seguro y Confidencial
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
            Tú no estás sola, <br/>nosotros te <span className="text-pink-300">escuchamos.</span>
          </h2>
          <p className="text-violet-100 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
            Página Violeta es el canal oficial del Municipio de San Pedro de los Milagros para reportar y recibir acompañamiento integral.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <button 
              onClick={() => window.location.hash = '#report'}
              className="bg-white text-violet-700 hover:bg-pink-50 px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
            >
              Denunciar Ahora
            </button>
            <button 
              onClick={() => document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 px-10 py-5 rounded-2xl font-black text-lg transition-all uppercase tracking-widest"
            >
              Saber más
            </button>
          </div>
        </div>
      </section>

      {/* Info Blocks */}
      <section id="info" className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-violet-100 hover:shadow-xl transition-all group">
          <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">100% Confidencial</h3>
          <p className="text-gray-500 leading-relaxed font-medium">Toda información suministrada es tratada bajo estrictos protocolos de seguridad y reserva legal por profesionales especializados.</p>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-violet-100 hover:shadow-xl transition-all group border-b-4 border-b-pink-400">
          <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Apoyo Integral</h3>
          <p className="text-gray-500 leading-relaxed font-medium">Acompañamiento jurídico, psicológico y social a través de la Coordinación de Equidad de Género y Despachos competentes.</p>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-violet-100 hover:shadow-xl transition-all group">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Ruta Efectiva</h3>
          <p className="text-gray-500 leading-relaxed font-medium">Gestión articulada entre Comisarías, Inspecciones y Secretaría de Gobierno para una respuesta rápida y efectiva.</p>
        </div>
      </section>

      {/* Educational Section */}
      <section className="bg-white rounded-[3rem] p-12 md:p-20 shadow-sm border border-violet-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-violet-900 mb-16 text-center uppercase tracking-tighter">Formación y Sensibilización</h2>
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-12 h-1 bg-pink-500 rounded-full"></span>
                <h4 className="text-2xl font-black text-pink-600 uppercase tracking-tight">¿Qué es la VBG?</h4>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                La Violencia Basada en Género (VBG) es cualquier acto dañino dirigido contra una persona debido a su género. Se basa en una desigualdad de poder y normas perjudiciales.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {['Violencia Física', 'Violencia Psicológica', 'Violencia Sexual', 'Violencia Económica'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-12 h-1 bg-violet-500 rounded-full"></span>
                <h4 className="text-2xl font-black text-violet-600 uppercase tracking-tight">Diversidad LGBTIQ+</h4>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                En San Pedro de los Milagros promovemos el respeto a la diversidad sexual y de género. La discriminación es una vulneración de derechos fundamentales.
              </p>
              <div className="bg-violet-600 p-8 rounded-[2rem] text-white shadow-xl">
                <p className="text-xl font-black italic mb-4 leading-tight">"El respeto a la diferencia es la base de una sociedad en paz."</p>
                <p className="text-violet-200 text-xs font-bold uppercase tracking-widest">Coordinación de Equidad de Género</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
