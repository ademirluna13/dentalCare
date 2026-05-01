import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Swal from 'sweetalert2';
import { PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Recibe el ID del paciente que el doctor está revisando
export const TreatmentManager = ({ patientId }: { patientId: string }) => {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario de nuevo tratamiento
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNextStep, setNewNextStep] = useState('');

  const fetchTreatments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (!error && data) setTreatments(data);
    setLoading(false);
  };

  useEffect(() => {
    if (patientId) fetchTreatments();
  }, [patientId]);

  // Crear un nuevo tratamiento
  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('treatments').insert([{
        patient_id: patientId,
        title: newTitle,
        description: 'Iniciado en clínica',
        status: 'in_progress',
        progress_percent: 0,
        next_step: newNextStep
      }]);

      if (error) throw error;
      
      Swal.fire({ icon: 'success', title: 'Tratamiento creado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
      setNewTitle('');
      setNewNextStep('');
      setIsAdding(false);
      fetchTreatments();
    } catch (err) {
      Swal.fire('Error', 'No se pudo crear el tratamiento', 'error');
    }
  };

  // Actualizar el progreso desde un slider
  const handleUpdateProgress = async (id: string, newProgress: number) => {
    try {
      const newStatus = newProgress === 100 ? 'completed' : 'in_progress';
      const { error } = await supabase
        .from('treatments')
        .update({ progress_percent: newProgress, status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Actualización optimista en la UI
      setTreatments(prev => prev.map(t => t.id === id ? { ...t, progress_percent: newProgress, status: newStatus } : t));
    } catch (err) {
      console.error("Error actualizando progreso:", err);
    }
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-50 rounded-[2rem]"></div>;

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-serif italic text-[#4A3737]">Plan de Tratamiento</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Control de evolución clínica</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-12 h-12 bg-[#4A3737] text-white rounded-2xl flex items-center justify-center hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all shadow-md"
        >
          <PlusIcon className={`w-6 h-6 transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddTreatment} className="mb-8 p-6 bg-[#F7F5F5] rounded-[2rem] border border-gray-100 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Nombre del Tratamiento</label>
              <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ej: Diseño de Sonrisa" className="w-full mt-1 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-sm focus:border-[#F4B6B6] transition-all text-[#4A3737]" />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Próximo Paso</label>
              <input type="text" required value={newNextStep} onChange={e => setNewNextStep(e.target.value)} placeholder="Ej: Toma de impresiones" className="w-full mt-1 p-4 bg-white border border-gray-100 rounded-2xl outline-none text-sm focus:border-[#F4B6B6] transition-all text-[#4A3737]" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-8 py-3 bg-[#F4B6B6] text-[#4A3737] font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-[#4A3737] hover:text-white transition-all shadow-sm">
              Guardar Tratamiento
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {treatments.length > 0 ? treatments.map((treatment) => (
          <div key={treatment.id} className="p-8 rounded-[2rem] border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
            {/* Fondo de progreso visual suave */}
            <div className="absolute top-0 left-0 h-1 bg-[#F4B6B6]/30 transition-all duration-500" style={{ width: `${treatment.progress_percent}%` }}></div>
            
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-xl font-serif italic text-[#4A3737]">{treatment.title}</h4>
                  {treatment.status === 'completed' && <span className="px-3 py-1 bg-[#A8D1C3]/20 text-[#A8D1C3] text-[8px] font-black uppercase tracking-widest rounded-full">Finalizado</span>}
                </div>
                <p className="text-xs text-gray-400 font-medium">Próximo paso: <span className="text-[#4A3737]">{treatment.next_step}</span></p>
              </div>

              <div className="w-full md:w-1/3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                  <span className="text-gray-400">Progreso</span>
                  <span className={treatment.progress_percent === 100 ? 'text-[#A8D1C3]' : 'text-[#F4B6B6]'}>{treatment.progress_percent}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" step="5"
                  value={treatment.progress_percent}
                  onChange={(e) => handleUpdateProgress(treatment.id, Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#F4B6B6]"
                />
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-12">
            <CheckCircleIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-serif italic text-gray-400 text-lg">No hay tratamientos activos.</p>
          </div>
        )}
      </div>
    </div>
  );
};