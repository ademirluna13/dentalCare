import React from 'react';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const HeroSection = () => {
  // Aquí pones el link de tu imagen tal cual
  const dentalImage = "https://i.ibb.co/bRNqQsx9/image.png";

  return (
    <section className="relative bg-brand-neutral pt-40 pb-32 px-8 md:px-20 overflow-hidden">
      {/* Fondos decorativos del sitio */}
      <div className="absolute top-0 right-0 w-[40%] h-[60%] bg-gradient-to-bl from-brand-primary/10 to-transparent blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[40%] bg-brand-secondary/30 blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-20 items-center">
        
        {/* --- LADO IZQUIERDO: TEXTOS --- */}
        <div className="relative z-10 space-y-12 animate-fade-in-up">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 border border-brand-primary/20 text-brand-primary bg-white/50 backdrop-blur-sm rounded-full">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em]">
                Estética Dental de Élite
              </span>
            </div>
            
            <h1 className="text-6xl md:text-[5.5rem] font-serif text-brand-dark leading-[0.85] tracking-tighter font-light">
              Donde el Arte <br />
              <span className="italic font-normal">Crea Sonrisas</span>
            </h1>
            
            <p className="text-lg md:text-xl text-brand-dark/60 font-sans font-light leading-relaxed max-w-xl">
              Fusionamos precisión clínica con una visión artística para diseñar sonrisas que no solo se ven perfectas, se sienten tuyas.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <button className="group px-12 py-5 bg-brand-dark text-white text-[11px] font-sans font-bold uppercase tracking-[0.2em] rounded-full transition-all hover:shadow-lg hover:-translate-y-1">
              <span className="flex items-center gap-3">
                Agendar Cita 
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            </button>
            <button className="px-10 py-5 text-brand-dark/80 border-b border-brand-primary/40 text-[11px] font-sans font-bold uppercase tracking-[0.2em] hover:text-brand-primary transition-all">
              Explorar Tratamientos
            </button>
          </div>
        </div>
        
        {/* --- LADO DERECHO: TU IMAGEN PURA --- */}
        <div className="relative">
          {/* Contenedor limpio: sin formas, sin filtros, sin máscaras */}
          <div className="relative z-10">
            <img 
              src={dentalImage} 
              alt="Tu Imagen" 
              className="w-full h-auto block rounded-lg shadow-2xl" // Solo un pequeño redondeado en las esquinas y sombra para que no flote feo
            />
          </div>

          {/* Card flotante informativa (se queda porque ayuda a la conversión) */}
          <div className="absolute -bottom-6 -right-6 md:-right-12 z-20 bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50 max-w-[220px]">
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-primary mb-2">Next Opening</p>
            <p className="text-xl font-serif italic text-brand-dark">Tomorrow, 09:00 AM</p>
          </div>

          <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -z-0" />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;