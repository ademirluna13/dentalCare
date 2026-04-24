import React from 'react';
import { CheckBadgeIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface TreatmentProps {
  title: string;
  progress: number;
  nextStep: string;
  status: string;
}

export const TreatmentCard = ({ title, progress, nextStep, status }: TreatmentProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-brand-primary/10 shadow-xl hover:shadow-2xl transition-all duration-500 group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-brand-primary/5 rounded-2xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-500">
          <BeakerIcon className="w-8 h-8" />
        </div>
        <span className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter border ${
          status === 'completed' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
        }`}>
          {status === 'completed' ? 'Finalizado' : 'En Curso'}
        </span>
      </div>

      <h4 className="text-2xl font-serif italic text-brand-dark mb-2">{title}</h4>
      
      {/* Barra de Progreso Estilizada */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-brand-primary/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-primary transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="pt-6 border-t border-brand-primary/5 flex items-center gap-3">
        <CheckBadgeIcon className="w-5 h-5 text-brand-primary/40" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30">Próximo paso</p>
          <p className="text-sm text-brand-dark/70 font-medium">{nextStep}</p>
        </div>
      </div>
    </div>
  );
};