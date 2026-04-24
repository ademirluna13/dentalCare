import React from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';

export const Experience = () => {
  return (
    <section className="py-24 px-8 md:px-20 bg-brand-neutral relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Contenedor Principal Split */}
        <div className="flex flex-col lg:flex-row rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(74,55,55,0.2)]">
          
          {/* --- LADO IZQUIERDO: EL TESTIMONIO --- */}
          <div className="lg:w-1/2 bg-brand-dark p-12 md:p-20 relative overflow-hidden flex flex-col justify-center">
            {/* Textura de fondo sutil */}
            <div className="absolute inset-0 bg-grain opacity-10 pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px]" />

            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.5em] text-brand-primary">
                  Sonrisas Saludables
                </span>
                <div className="h-[1px] w-12 bg-brand-primary/50" />
              </div>

              <blockquote className="text-3xl md:text-4xl font-serif italic text-white leading-tight tracking-tight">
                "Elegir Luminous fue la mejor decisión para mi familia. Mis hijos disfrutan sus chequeos y los resultados estéticos son simplemente impecables. Estoy profundamente agradecida."
              </blockquote>

              <div className="pt-6">
                <p className="text-sm font-sans font-bold uppercase tracking-widest text-brand-primary">
                  — Lucía García
                </p>
                <p className="text-[10px] font-sans text-white/40 uppercase tracking-[0.2em] mt-1">
                  Paciente VIP / Restauración Estética
                </p>
              </div>

              {/* Paginación / Dots Pro */}
              <div className="flex gap-3 pt-8">
                <div className="w-8 h-1 bg-brand-primary rounded-full" />
                <div className="w-2 h-1 bg-white/20 rounded-full hover:bg-white/40 transition-all cursor-pointer" />
                <div className="w-2 h-1 bg-white/20 rounded-full hover:bg-white/40 transition-all cursor-pointer" />
              </div>
            </div>
          </div>

          {/* --- LADO DERECHO: EL VIDEO (CON VIDEO PLAYER PRO) --- */}
          <div className="lg:w-1/2 relative aspect-video lg:aspect-auto min-h-[400px] group cursor-pointer overflow-hidden bg-brand-secondary">
            {/* Imagen de Preview con Filtro */}
            <img 
              src="https://images.unsplash.com/photo-1629909608135-ca29e0026f51?q=80&w=2000" 
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-1000"
              alt="Video de la Clínica"
            />
            {/* Overlay de Tinte Rose Gold */}
            <div className="absolute inset-0 bg-brand-primary/20 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700" />
            
            {/* Botón de Play "Rompebolas" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Ondas de Pulso */}
                <div className="absolute inset-0 bg-brand-primary rounded-full animate-ping opacity-40" />
                <div className="absolute inset-0 bg-brand-primary rounded-full animate-pulse opacity-60 scale-125" />
                
                {/* El Botón Real */}
                <button className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <PlayIcon className="w-8 h-8 text-brand-dark ml-1" />
                </button>
              </div>
            </div>

            {/* Etiqueta flotante de "Sobre Nosotros" */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end z-20">
               <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                  <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-white/60 mb-1">Video Tour</p>
                  <p className="text-lg font-serif italic text-white">Conoce el Santuario</p>
               </div>
               <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white text-[10px] hover:bg-white hover:text-brand-dark transition-all">
                  4K
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};