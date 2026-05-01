import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Sidebar } from '../../../Shared/Sidebar';
import { TreatmentCard } from '../../../../Components/Dashboards/Patient/TratementsCard';
import { 
  ArrowPathIcon, 
  SparklesIcon, 
  FaceSmileIcon, 
  ClipboardDocumentCheckIcon 
} from '@heroicons/react/24/outline';

export const TreatmentsPage = () => {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: treatmentData, error: tError } = await supabase
        .from('treatments')
        .select('id, title, progress_percent, next_step, status')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (tError) console.error("Error en tratamientos:", tError.message);

      const { data: noteData } = await supabase
        .from('medical_notes')
        .select('*, doctor:profiles!doctor_id(full_name)')
        .eq('patient_id', user.id)
        .eq('category', 'recomendacion')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (treatmentData) setTreatments(treatmentData);
      if (noteData) setRecommendation(noteData);

    } catch (err) {
      console.error("Error crítico de sincronización:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4]">
        <div className="flex flex-col items-center gap-4 text-center">
          <ArrowPathIcon className="w-12 h-12 text-[#F4B6B6] animate-spin" />
          <p className="font-serif italic text-[#4A3737] text-xl">Preparando tu evolución...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] overflow-x-hidden w-full max-w-[100vw]">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-32 lg:pt-12 bg-[#F8F7F4] min-h-screen w-full relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* HEADER: ESTANDARIZADO */}
          <header className="px-2 space-y-2">
            
            
            <h1 className="text-5xl md:text-7xl font-serif italic text-[#4A3737] leading-none tracking-tighter">
              Mi <span className="text-[#F4B6B6]">Evolución</span>
            </h1>
            
            <p className="text-[#4A3737]/40 uppercase tracking-[0.3em] text-[9px] font-black ml-1">
              Progreso Clínico • Perfección Estética • Santuario
            </p>
          </header>

          <hr className="border-[#4A3737]/5 mx-2" />

          {/* GRID DE CARDS: 1 columna en móvil, 2 en PC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-2">
            {treatments.length > 0 ? (
              treatments.map(t => (
                <TreatmentCard 
                  key={t.id} 
                  title={t.title}
                  progress={t.progress_percent} 
                  nextStep={t.next_step}
                  status={t.status}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 mx-2 flex flex-col items-center gap-4">
                 <div className="p-6 bg-gray-50 rounded-full">
                  {/* ÍCONO CAMBIADO: Sonrisa / Estética Dental */}
                  <FaceSmileIcon className="w-12 h-12 text-gray-300" />
                </div>
                <div className="space-y-2">
                  <p className="font-serif italic text-[#4A3737]/40 text-2xl">Aún no hay tratamientos registrados.</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Pronto diseñaremos tu nueva sonrisa.</p>
                </div>
              </div>
            )}
          </div>

          {/* RECOMENDACIÓN DEL DOC: REGRESO AL DARK MODE MAMALÓN */}
          {recommendation ? (
            <div className="mx-2 bg-[#4A3737] p-8 md:p-16 rounded-[3rem] md:rounded-[4.5rem] text-white overflow-hidden relative shadow-2xl group transition-all">
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl text-[#F4B6B6] backdrop-blur-sm">
                    {/* ÍCONO CAMBIADO: Expediente Médico */}
                    <ClipboardDocumentCheckIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl md:text-4xl font-serif italic leading-tight">Recomendación Médica</h3>
                </div>
                
                <div className="pl-6 border-l-2 border-[#F4B6B6]/40 py-2">
                  <p className="text-white/90 font-light text-xl md:text-2xl max-w-3xl leading-relaxed">
                    "{recommendation.content}"
                  </p>
                </div>
                
                <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-[#F4B6B6] font-black uppercase tracking-[0.4em] text-[9px]">
                    Prescrito por Dr. {recommendation.doctor?.full_name || 'Staff Luminous'}
                  </p>
                  {/* Aura pulsante tipo indicador médico */}
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-green-400">Activa</span>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                  </div>
                </div>
              </div>
              
              {/* Decoración BitXolo */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 md:w-96 md:h-96 bg-[#F4B6B6]/5 rounded-full blur-[100px] group-hover:bg-[#F4B6B6]/10 transition-all" />
            </div>
          ) : (
             <div className="p-10 text-center opacity-30">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#4A3737]">Esperando evaluación del especialista</p>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};