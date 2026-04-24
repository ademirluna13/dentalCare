
export const Concierge = () => {
  return (
    <section className="py-32 px-8 md:px-20 bg-brand-neutral relative overflow-hidden">
      {/* Decoración de fondo Senior */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-secondary/40 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          {/* --- LADO IZQUIERDO: EL MANIFIESTO --- */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-12 bg-brand-primary" />
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.5em] text-brand-primary">
                  Ecosistema Digital
                </span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-serif text-brand-dark leading-[0.85] tracking-tighter">
                Consejeria <br />
                <span className="italic font-normal shimmer">Inteligente</span>
              </h2>
              
              <p className="text-brand-dark/60 font-sans font-light text-xl max-w-md leading-relaxed">
                Más que una clínica, un santuario digital. Gestiona tu camino hacia la perfección estética con nuestro portal de alto rendimiento.
              </p>
            </div>

            {/* Status Modules (UX de confianza) */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-brand-primary/10 shadow-sm transition-all hover:border-brand-primary/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-dark/70">Sistema Activo</span>
              </div>
              
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-brand-primary/10 shadow-sm">
                <svg className="w-3 h-3 text-brand-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-dark/70">Grado Médico AES-256</span>
              </div>
            </div>
          </div>

          {/* --- LADO DERECHO: ACCESO VIP --- */}
          <div className="relative group">
            {/* Glow dinámico de fondo */}
            <div className="absolute inset-0 bg-brand-primary/20 blur-[100px] rounded-full scale-90 group-hover:scale-110 transition-transform duration-1000" />
            
            {/* Card Principal */}
            <div className="relative z-10 bg-white/80 backdrop-blur-2xl p-10 md:p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(74,55,55,0.15)] border border-white group-hover:shadow-[0_60px_120px_-20px_rgba(244,182,182,0.3)] transition-all duration-700">
              <h3 className="text-4xl font-serif italic text-brand-dark mb-10 tracking-tight text-center lg:text-left">
                Elige tu puerta de entrada
              </h3>
              
              <div className="space-y-6">
                {/* Opción 1: Nuevo Paciente */}
                <button className="w-full group/btn flex items-center justify-between p-8 bg-brand-neutral/50 rounded-[2.5rem] border border-brand-primary/10 hover:border-brand-primary/40 hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl">
                  <div className="text-left">
                    <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-primary mb-2">Primera vez</p>
                    <p className="text-2xl font-serif text-brand-dark group-hover/btn:italic transition-all">Diseñar mi sonrisa</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white border border-brand-primary/20 flex items-center justify-center group-hover/btn:bg-brand-primary group-hover/btn:text-white transition-all duration-500 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </div>
                </button>

                {/* Opción 2: Member (Login al Dashboard) */}
                <button className="w-full group/btn flex items-center justify-between p-8 bg-brand-dark rounded-[2.5rem] hover:bg-brand-primary transition-all duration-700 shadow-2xl shadow-brand-dark/20">
                  <div className="text-left">
                    <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-white/40 mb-2">Miembro Luminous</p>
                    <p className="text-2xl font-serif text-white group-hover/btn:italic transition-all">Acceso al Portal</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-brand-primary transition-all duration-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20c1.92 0 3.692-.537 5.202-1.467m-9.117-12.15l.054-.09A10.003 10.003 0 0112 4c1.92 0 3.692.537 5.202 1.467m-1.332 10.23a10.003 10.003 0 01-1.332-10.23M12 11h.01" /></svg>
                  </div>
                </button>
              </div>

              {/* Sello de Agencia */}
              <div className="mt-12 flex flex-col items-center gap-2">
                <div className="h-[1px] w-12 bg-brand-primary/20" />
                <p className="text-[9px] font-sans font-bold text-brand-dark/30 uppercase tracking-[0.4em]">
                  Creative Engineering by Malbitec
                </p>
              </div>
            </div>

            {/* Toque extra: Borde de luz metálica */}
            <div className="absolute inset-0 border border-white/40 rounded-[4rem] pointer-events-none z-20" />
          </div>

        </div>
      </div>
    </section>
  );
};