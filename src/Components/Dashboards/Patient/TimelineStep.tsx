import React from 'react';

// Definimos las props para que TypeScript no se queje
interface TimelineStepProps {
  title: string;
  status: string;
  active?: boolean;
  progress: number;
}

export const TimelineStep = ({ title, status, active, progress }: TimelineStepProps) => {
  return (
    <div className="relative pl-12 group">
      
      {/* EL INDICADOR (Círculo en la línea) */}
      <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-4 border-[#4A3737] z-10 flex items-center justify-center transition-all duration-500 
        ${active ? 'bg-[#F4B6B6] scale-110 shadow-[0_0_15px_rgba(244,182,182,0.3)]' : 'bg-white/20'}`}>
        {/* Solo el activo tiene el pulso blanco */}
        {active && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
      </div>

      <div className="space-y-1.5">
        {/* ESTATUS: En rosa si es activo, en blanco tenue si no */}
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 
          ${active ? 'text-[#F4B6B6]' : 'text-white/40'}`}>
          {status}
        </p>

        {/* TÍTULO: Blanco nítido para que se lea perfecto sobre el café */}
        <h4 className={`text-xl font-serif italic leading-none transition-colors duration-500 
          ${active ? 'text-white' : 'text-white/60'}`}>
          {title}
        </h4>

        {/* BARRA DE PROGRESO INTERNA */}
        <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out 
              ${active ? 'bg-[#F4B6B6]' : 'bg-white/30'}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
};