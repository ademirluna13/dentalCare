import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white pt-32 pb-12 px-8 md:px-20 relative overflow-hidden">
      
      {/* Texto Monumental de Fondo (Watermark) */}
      <div className="absolute bottom-[-5%] left-0 w-full pointer-events-none select-none overflow-hidden">
        <h2 className="text-[20vw] font-serif italic text-white/[0.03] leading-none whitespace-nowrap">
          Luminous Clinic
        </h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-24">
          
          {/* COLUMNA 1: BRANDING */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-serif italic text-brand-primary">Luminous</h3>
              <p className="text-white/50 font-sans font-light text-sm leading-relaxed max-w-xs">
                Redefiniendo la estética dental a través de la fusión perfecta entre maestría artística y precisión clínica.
              </p>
            </div>
            {/* Redes Sociales */}
            <div className="flex gap-5">
              {['IN', 'FB', 'IG'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-sans font-bold tracking-widest hover:bg-brand-primary hover:border-brand-primary transition-all duration-500">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* COLUMNA 2: SERVICIOS */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-brand-primary/60">Tratamientos</h4>
            <ul className="space-y-4 text-sm font-sans font-light text-white/70">
              {['Ortodoncia Invisible', 'Diseño de Sonrisa', 'Implantes Premium', 'Blanqueamiento Láser'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-brand-primary transition-colors duration-300 flex items-center group">
                    <span className="h-[1px] w-0 bg-brand-primary mr-0 group-hover:w-4 group-hover:mr-3 transition-all duration-500"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: CONTACTO */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-brand-primary/60">Contacto</h4>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/30">Ubicación</p>
                <p className="text-sm font-serif italic leading-relaxed">
                  Avenida Reforma 222, <br />
                  Ciudad de México, CP 06600
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/30">Teléfono</p>
                <p className="text-sm font-serif italic">+52 (55) LUMI-DENT</p>
              </div>
            </div>
          </div>

          {/* COLUMNA 4: NEWSLETTER */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-brand-primary/60">Newsletter</h4>
            <div className="space-y-6">
              <p className="text-sm font-sans font-light text-white/50 leading-relaxed">
                Suscríbete para recibir consejos de estética dental y noticias exclusivas.
              </p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Tu email" 
                  className="w-full bg-transparent border-b border-white/10 py-3 px-0 focus:outline-none focus:border-brand-primary transition-colors font-serif italic text-sm text-white"
                />
                <button className="absolute right-0 bottom-3 text-brand-primary hover:scale-110 transition-transform">
                  →
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* BARRA INFERIOR: LEGAL & MALBITEC */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[9px] font-sans font-bold uppercase tracking-[0.3em] text-white/30">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[8px] font-sans font-bold uppercase tracking-[0.5em] text-white/20 leading-none">Desarrollado por</p>
              <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-brand-primary">
                Malbitec Creative Engineering
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
              <span className="text-brand-primary font-bold text-sm">M</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};