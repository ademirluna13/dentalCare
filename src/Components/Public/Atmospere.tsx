import React from 'react';

export const Atmosphere = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-brand-neutral">
      {/* Grano Global */}
      <div className="absolute inset-0 bg-grain" />

      {/* Luces y sombras orgánicas */}
      <div className="absolute top-[10%] -left-[10%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute top-[40%] -right-[5%] w-[500px] h-[500px] bg-brand-secondary/40 rounded-full blur-[100px] animate-pulse-slow delay-700" />
      <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[90px]" />
      
      {/* Marcas de agua estratégicas para "rellenar" espacios */}
      <div className="absolute top-[25%] left-10 rotate-90 origin-left">
        <span className="watermark-text">ESTÉTICA</span>
      </div>
      <div className="absolute bottom-[15%] right-10 -rotate-90 origin-right">
        <span className="watermark-text">PRECISIÓN</span>
      </div>
    </div>
  );
};