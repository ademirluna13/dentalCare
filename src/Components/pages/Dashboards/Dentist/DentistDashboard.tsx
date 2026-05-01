import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { supabase } from '../../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  ClockIcon, 
  UserIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BeakerIcon,
  ArrowUturnLeftIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export const DentistDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePatient, setActivePatient] = useState<any | null>(null);
  const [patientNotes, setPatientNotes] = useState<any[]>([]);
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // --- ESTADOS PARA EL MODAL DE RECOMENDACIÓN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendation, setRecommendation] = useState('');

  const fetchTodayAppointments = async () => {
    setLoading(true);
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, profiles!inner(id, full_name, avatar_url)')
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .order('appointment_date', { ascending: true });

      if (!error && data) setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const handleSelectPatient = async (appointment: any) => {
    setActivePatient(appointment);
    const { data } = await supabase
      .from('medical_notes')
      .select('*')
      .eq('patient_id', appointment.patient_id)
      .eq('category', 'alergia')
      .order('created_at', { ascending: false });
      
    setPatientNotes(data || []);
  };

  const handleOpenFinishModal = () => {
    if (!activePatient) return;
    setRecommendation(''); 
    setIsModalOpen(true);
  };

  // --- FUNCIÓN FINAL BLINDADA Y FIRMADA ---
  const submitFinishConsultation = async () => {
    if (!activePatient || processingId) return;
    setProcessingId(activePatient.id);
    
    try {
      // 0. ¿Qué doctor está haciendo esto?
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Guardamos la recomendación con el ID del doctor real
      if (recommendation.trim() !== '') {
        const { error: noteError } = await supabase.from('medical_notes').insert([{
          patient_id: activePatient.patient_id,
          doctor_id: user?.id, // <-- FIRMA DEL DOCTOR
          category: 'recomendacion',
          content: recommendation
        }]);

        if (noteError) {
          console.error("Fallo al guardar la nota:", noteError);
          throw new Error("No se pudo guardar la nota de evolución.");
        }
      }

      // 2. Cerramos la cita
      const { error: appError } = await supabase
        .from('appointments')
        .update({ status: 'attended' })
        .eq('id', activePatient.id);

      if (appError) throw appError;

      // Actualizamos UI
      setAppointments(prev => prev.map(a => a.id === activePatient.id ? { ...a, status: 'attended' } : a));

      Swal.fire({
        icon: 'success',
        title: 'Consulta Terminada',
        text: 'Evolución guardada y firmada por el doctor.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });

      setIsModalOpen(false);
      setActivePatient(null);
    } catch (err: any) {
      Swal.fire('Error', err.message || 'No se pudo cerrar la consulta', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUndoConsultation = async (appointmentId: string) => {
    if (processingId) return;
    setProcessingId(appointmentId);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'scheduled' })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'scheduled' } : a));

      Swal.fire({ icon: 'info', title: 'Regresado a Pendientes', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire('Error', 'No se pudo deshacer', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const pendientes = appointments.filter(a => a.status !== 'attended');
  const atendidos = appointments.filter(a => a.status === 'attended');

  return (
    <div className="flex min-h-screen bg-[#F7F5F5] relative">
      <Sidebar />
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in text-[#4A3737]">
          
          {/* HEADER DEL DOCTOR GUAPO */}
          <header className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-[#F4B6B6] flex items-center justify-center overflow-hidden shadow-md border border-gray-100">
                  <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200" alt="Doctor" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-4 border-white rounded-full"></div>
              </div>
              <div>
                <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px] mb-1">Especialista en Turno</p>
                <h1 className="text-3xl font-serif italic text-[#4A3737]">Dr. Alejandro Ruiz</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rehabilitación Estética</p>
              </div>
            </div>

            <div className="text-right hidden md:block">
              <p className="text-[#4A3737]/40 font-black uppercase tracking-[0.2em] text-[10px] mb-2">{todayFormatted}</p>
              <div className="flex items-center gap-2 justify-end text-[#F4B6B6]">
                <div className="w-2 h-2 rounded-full bg-[#F4B6B6] animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Santuario Activo</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* COLUMNA IZQUIERDA: PACIENTE EN SILLA */}
            <section className="xl:col-span-8 space-y-8">
              {activePatient ? (
                <div className="bg-[#4A3737] p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden transition-all animate-slide-up">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <UserIcon className="w-64 h-64" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white text-[#4A3737] flex items-center justify-center font-serif italic text-5xl shadow-xl shrink-0">
                      {activePatient.profiles?.avatar_url ? (
                        <img src={activePatient.profiles.avatar_url} className="w-full h-full object-cover rounded-[2.5rem]" alt="avatar" />
                      ) : (
                        activePatient.profiles?.full_name?.charAt(0)
                      )}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4B6B6] mb-2">Paciente en Consulta</p>
                          <h2 className="text-4xl font-serif italic leading-none">{activePatient.profiles?.full_name}</h2>
                        </div>
                        <span className="px-4 py-2 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#F4B6B6] border border-white/20">
                          {activePatient.title || 'Revisión General'}
                        </span>
                      </div>

                      {patientNotes.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-6">
                          {patientNotes.map(note => (
                            <div key={note.id} className="flex items-center gap-2 bg-rose-500/20 text-rose-300 px-4 py-2 rounded-xl border border-rose-500/30">
                              <ExclamationTriangleIcon className="w-4 h-4" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">{note.content}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-6">Sin alertas médicas de riesgo</p>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                    <button onClick={() => navigate(`/dentista/pacientes/${activePatient.patient_id}`)} className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5" /> Expediente Completo
                    </button>
                    <button 
                      onClick={() => navigate(`/dentista/odontogramas/${activePatient.patient_id}`)}
                      className="px-6 py-4 bg-white/10 hover:bg-[#F4B6B6] hover:text-[#4A3737] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
                    >
                      <BeakerIcon className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" /> 
                      Odontograma
                    </button>
                    
                    <div className="flex-1"></div>
                    
                    {/* BOTÓN ABRE MODAL */}
                    <button 
                      onClick={handleOpenFinishModal} 
                      className="px-8 py-4 bg-[#F4B6B6] text-[#4A3737] hover:bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" /> Terminar Consulta
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[4rem] p-20 shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                  <div className="p-8 bg-[#F7F5F5] rounded-full text-gray-200 mb-6">
                    <UserIcon className="w-16 h-16" />
                  </div>
                  <h3 className="text-3xl font-serif italic text-[#4A3737]">Silla Disponible</h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto mt-3">Selecciona un paciente de tu lista para iniciar la consulta.</p>
                </div>
              )}
            </section>

            {/* COLUMNA DERECHA: AGENDA DEL DOCTOR */}
            <aside className="xl:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-50">
                <div className="flex items-center justify-between mb-8 px-2">
                  <h4 className="text-xl font-serif italic text-[#4A3737]">Citas de Hoy</h4>
                  <span className="w-8 h-8 rounded-full bg-[#FCECEC] text-[#F4B6B6] flex items-center justify-center text-xs font-bold">
                    {pendientes.length}
                  </span>
                </div>

                <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {loading ? (
                    <p className="text-center text-xs text-gray-400 italic py-10">Cargando agenda...</p>
                  ) : (
                    <>
                      {pendientes.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#4A3737]/40 px-2">Por Atender</p>
                          {pendientes.map((app) => {
                            const isActive = activePatient?.id === app.id;
                            return (
                              <div key={app.id} onClick={() => handleSelectPatient(app)} className={`p-6 rounded-[2rem] border transition-all flex items-center gap-5 cursor-pointer ${isActive ? 'border-[#F4B6B6] bg-[#FCECEC]/30 shadow-md scale-105' : 'bg-white border-gray-50 hover:border-[#F4B6B6]/50 hover:shadow-sm'}`}>
                                <div className="w-12 h-12 rounded-2xl bg-[#F7F5F5] text-[#4A3737] flex items-center justify-center shrink-0"><ClockIcon className="w-5 h-5" /></div>
                                <div className="flex-1 overflow-hidden">
                                  <p className={`font-black text-[10px] mb-1 uppercase tracking-widest ${isActive ? 'text-[#F4B6B6]' : 'text-gray-400'}`}>{new Date(app.appointment_date).getUTCHours().toString().padStart(2, '0')}:00</p>
                                  <p className="font-serif italic text-lg text-[#4A3737] truncate leading-tight">{app.profiles?.full_name}</p>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate">{app.title}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {atendidos.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-gray-50">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A8D1C3] px-2">Completados hoy</p>
                          {atendidos.map((app) => (
                            <div key={app.id} className="p-5 rounded-[2rem] border border-gray-50 bg-gray-50/40 opacity-80 flex items-center gap-4 group transition-all">
                              <div className="w-10 h-10 rounded-xl bg-[#A8D1C3]/20 text-[#A8D1C3] flex items-center justify-center shrink-0"><CheckCircleIcon className="w-5 h-5" /></div>
                              <div className="flex-1 overflow-hidden">
                                <p className="font-serif italic text-base text-gray-500 truncate">{app.profiles?.full_name}</p>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Atendido con éxito</p>
                              </div>
                              <button onClick={() => handleUndoConsultation(app.id)} disabled={processingId === app.id} title="Regresar a pendientes" className="p-2 text-gray-300 hover:text-rose-400 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                                {processingId === app.id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <ArrowUturnLeftIcon className="w-5 h-5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {appointments.length === 0 && <p className="text-center text-sm font-serif italic text-gray-300 py-10">Agenda libre por hoy.</p>}
                    </>
                  )}
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>

      {/* --- MODAL DE RECOMENDACIÓN Y CIERRE --- */}
      {isModalOpen && activePatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#4A3737]/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl animate-scale-up">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 bg-gray-50 text-gray-400 hover:text-[#4A3737] hover:bg-gray-100 rounded-2xl transition-all">
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[10px] mb-2">Paso Final</p>
              <h2 className="text-4xl font-serif italic text-[#4A3737] leading-none">Nota de Evolución</h2>
              <p className="text-sm text-gray-400 mt-4">Escribe un mensaje de seguimiento o recomendación para <strong>{activePatient.profiles?.full_name}</strong>. Este mensaje aparecerá en su portal de paciente.</p>
            </div>

            <textarea 
              className="w-full bg-[#F7F5F5] border border-gray-100 rounded-3xl p-6 h-40 outline-none focus:border-[#F4B6B6] transition-all text-[#4A3737] placeholder-gray-400 resize-none font-serif italic"
              placeholder='Ej: "Ademir, vas por excelente camino. Recuerda evitar alimentos muy pigmentados..."'
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
            ></textarea>

            <div className="mt-8 flex items-center justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#4A3737] transition-colors">
                Cancelar
              </button>
              <button 
                onClick={submitFinishConsultation}
                disabled={processingId === activePatient.id}
                className="px-8 py-4 bg-[#4A3737] hover:bg-[#F4B6B6] hover:text-[#4A3737] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {processingId === activePatient.id ? 'Guardando...' : 'Guardar y Terminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};