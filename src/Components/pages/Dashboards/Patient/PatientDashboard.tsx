import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { Sidebar } from '../../../Shared/Sidebar';
import { PaymentRow } from '../../../Dashboards/Patient/PaymentRow';
import { TimelineStep } from '../../../Dashboards/Patient/TimelineStep';
import { FileCard } from '../../../Dashboards/Patient/FileCard';
import { BookAppointment } from '../../../Dashboards/Patient/BookAppointment'; 
import { useDashboardData } from '../../../../hooks/useDashboardData';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  CalendarIcon, 
  CreditCardIcon, 
  HeartIcon, 
  ArrowPathIcon,
  DocumentIcon,
  XMarkIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const MySwal = withReactContent(Swal);

export const PatientDashboard = () => {
  const { patient, nextAppointment, payments, studies, loading: dataLoading } = useDashboardData();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);

  const [treatments, setTreatments] = useState<any[]>([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(true);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('treatments')
            .select('*')
            .eq('patient_id', user.id)
            .order('created_at', { ascending: true }); 
          if (data) setTreatments(data);
        }
      } catch (err) {
        console.error("Error cargando evolución:", err);
      } finally {
        setTreatmentsLoading(false);
      }
    };
    fetchTreatments();
  }, []);

  const handleCancel = async () => {
    if (!nextAppointment) return;

    const result = await MySwal.fire({
      title: <span className="font-serif italic text-[#4A3737]">¿Deseas cancelar?</span>,
      html: <p className="text-sm text-[#4A3737]/60 font-sans">Esta acción liberará tu espacio en el santuario.</p>,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      confirmButtonColor: '#F4B6B6',
      cancelButtonColor: '#2C2C2C',
      background: '#F8F7F4', 
      customClass: {
        popup: 'rounded-[3rem] border border-[#F4B6B6]/20 shadow-2xl',
        confirmButton: 'rounded-full px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-[#4A3737]',
        cancelButton: 'rounded-full px-8 py-3 text-[10px] font-bold uppercase tracking-widest'
      }
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', nextAppointment.id);

        if (error) throw error;
        await MySwal.fire({ title: 'Cancelada', icon: 'success', timer: 2000, showConfirmButton: false });
        window.location.reload();
      } catch (error: any) {
        MySwal.fire('Error', error.message, 'error');
      }
    }
  };

  if (dataLoading || treatmentsLoading) return (
    <div className="h-screen bg-[#F8F7F4] flex flex-col items-center justify-center">
      <div className="relative">
        <ArrowPathIcon className="w-16 h-16 text-[#F4B6B6] animate-spin" />
        <div className="absolute inset-0 blur-2xl bg-[#F4B6B6]/20 animate-pulse" />
      </div>
      <p className="font-serif italic text-[#4A3737] mt-6 text-xl">Sincronizando santuario...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] overflow-x-hidden w-full max-w-[100vw]"> 
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-4 md:p-12 pt-32 lg:pt-16 bg-[#F8F7F4] min-h-screen lg:rounded-l-[4rem] relative z-10 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
          
          
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-stretch px-2">
            <header className="xl:col-span-3 flex flex-col sm:flex-row items-center sm:items-start gap-8 p-10 bg-white rounded-[3.5rem] border border-gray-50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B6B6]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden border-8 border-white shadow-2xl relative z-10 bg-[#F8F7F4]">
                  {patient?.avatar_url ? (
                    <img src={patient.avatar_url} alt="Profile" className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#F4B6B6] text-6xl font-serif">
                      {patient?.full_name?.[0]}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 bg-white p-2 rounded-2xl shadow-xl z-20 border border-gray-50">
                  <CheckBadgeIcon className="w-7 h-7 text-[#F4B6B6]" />
                </div>
              </div>

              <div className="space-y-4 flex-1 z-10 text-center sm:text-left">
                <div className="space-y-1">
                   
                  <h1 className="text-4xl sm:text-6xl font-serif italic text-[#4A3737] leading-none tracking-tighter">
                    Hola, <span className="text-[#F4B6B6]">{patient?.full_name?.split(' ')[0]}</span>
                  </h1>
                </div>
                <p className="text-[#4A3737]/40 font-light text-lg">Bienvenido de vuelta a tu santuario.</p>
                <span className="inline-block text-[9px] font-black uppercase tracking-[0.3em] text-[#4A3737]/60 bg-[#F8F7F4] px-4 py-2 rounded-full">
                  Paciente VIP Luminous
                </span>
              </div>
            </header>

            {/* CARD PRÓXIMA CITA: ESTILO TESLA */}
            <div className="bg-[#4A3737] p-10 rounded-[3.5rem] text-white flex flex-col justify-center shadow-2xl relative overflow-hidden group xl:col-span-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4B6B6]/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-[#F4B6B6]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4B6B6]">Protocolo de Cita</p>
                </div>
                {nextAppointment ? (
                  <div className="space-y-1">
                    <p className="text-5xl font-serif italic text-white leading-none">
                      {new Date(nextAppointment.appointment_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                        <ClockIcon className="w-4 h-4 text-[#F4B6B6]/60" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
                            {new Date(nextAppointment.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })} hrs
                        </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-serif italic text-white/30">Sin agenda activa</p>
                )}
              </div>
              <CalendarIcon className="absolute -right-8 -bottom-8 w-40 h-40 text-white/[0.03] group-hover:rotate-6 transition-transform duration-1000" />
            </div>
          </div>

          {/* CUERPO PRINCIPAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-2">
            <div className="lg:col-span-8 space-y-8">
              {/* ACCIÓN RÁPIDA: CITA */}
              <div className="bg-white p-8 sm:p-10 rounded-[3.5rem] border border-gray-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="p-5 bg-[#FCECEC] rounded-[2rem] text-[#F4B6B6] group-hover:bg-[#4A3737] group-hover:text-white transition-all duration-500">
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-serif italic text-[#4A3737]">Gestión de Citas</h3>
                    <p className="text-sm text-[#4A3737]/40 mt-1">{nextAppointment?.title || 'Sincroniza tu próxima visita'}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                  {nextAppointment && (
                    <button onClick={handleCancel} className="px-8 py-4 border border-gray-100 text-[#4A3737]/30 text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-rose-50 hover:text-rose-400 hover:border-rose-100 transition-all">
                      Cancelar
                    </button>
                  )}
                  <button onClick={() => setShowBooking(true)} className="px-10 py-4 bg-[#4A3737] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all active:scale-95">
                    {nextAppointment ? 'Reprogramar' : 'Agendar Ahora'}
                  </button>
                </div>
              </div>

              {/* PAGOS RECIENTES */}
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-[#FCECEC] rounded-xl text-[#F4B6B6]">
                    <CreditCardIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif italic text-[#4A3737]">Estados de Cuenta</h3>
                </div>
                <div className="space-y-1">
                  {payments.length > 0 ? payments.slice(0, 3).map((p: any) => (
                    <PaymentRow key={p.id} title={p.description} date={new Date(p.created_at).toLocaleDateString('es-ES', {dateStyle: 'medium'})} amount={p.amount} status={p.status} />
                  )) : (
                    <div className="text-center py-10 opacity-20">
                        <p className="text-[10px] font-black uppercase tracking-widest">Sin transacciones registradas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TIMELINE LATERAL: EVOLUCIÓN */}
            <div className="lg:col-span-4">
              <div className="bg-[#4A3737] p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden min-h-[500px]">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12 text-white">
                    <div className="flex items-center gap-3">
                        <HeartIcon className="w-6 h-6 text-[#F4B6B6]" />
                        <h3 className="text-2xl font-serif italic">Tu Evolución</h3>
                    </div>
                    <button onClick={() => navigate('/dashboard/tratamiento')} className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F4B6B6]/60 hover:text-[#F4B6B6]">Ver todo</button>
                    </div>

                    <div className="space-y-10 relative pl-4">
                    <div className="absolute left-6 top-2 bottom-2 w-[1px] bg-[#F4B6B6]/10" />
                    
                    {treatments.length > 0 ? (
                        treatments.map((t, index) => (
                        <TimelineStep 
                            key={t.id}
                            title={t.title} 
                            status={t.status === 'completed' ? 'Finalizado' : 'En curso'} 
                            active={index === treatments.length - 1} 
                            progress={t.progress_percent} 
                        />
                        ))
                    ) : (
                        <div className="text-center py-20 opacity-30">
                        <p className="text-[#F4B6B6] font-serif italic">Iniciando protocolo...</p>
                        </div>
                    )}
                    </div>
                </div>
                {/* Decoración de fondo */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#F4B6B6]/5 rounded-full blur-[100px]" />
              </div>
            </div>
          </div>

          {/* REPOSITORIO DE ESTUDIOS */}
          <div className="space-y-8 pt-8 px-2">
            <div className="flex justify-between items-end px-4">
                <div className="space-y-1">
                    <h3 className="text-4xl font-serif italic text-[#4A3737]">Repositorio</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#4A3737]/30">Biblioteca de ingeniería dental</p>
                </div>
                <button onClick={() => navigate('/dashboard/estudios')} className="text-[10px] font-black uppercase tracking-widest text-[#F4B6B6] hover:text-[#4A3737] transition-all">Explorar biblioteca</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {studies.slice(0, 3).map((s: any) => (
                <a key={s.id} href={s.file_url} target="_blank" rel="noreferrer" className="block group transition-transform active:scale-95">
                  <FileCard title={s.title} info={s.file_type.toUpperCase()} icon={s.file_type === 'pdf' ? '📄' : '🦷'} />
                </a>
              ))}
              
              <div onClick={() => navigate('/dashboard/estudios')} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#F4B6B6]/40 hover:shadow-2xl transition-all group min-h-[160px]">
                <div className="p-4 bg-[#F8F7F4] rounded-2xl group-hover:bg-[#4A3737] group-hover:text-white transition-all duration-500 mb-4">
                    <DocumentIcon className="w-6 h-6 text-gray-300 group-hover:text-white" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#4A3737]/40 group-hover:text-[#4A3737]">Ver todos</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MODAL AGENDAR: GLASSMORPHISM */}
      {showBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#4A3737]/60 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full relative">
            <button onClick={() => setShowBooking(false)} className="absolute -top-16 right-0 text-white hover:text-[#F4B6B6] transition-colors flex items-center gap-3 group">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Cerrar Protocolo</span>
              <XMarkIcon className="w-10 h-10" />
            </button>
            <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/20">
                <BookAppointment patientId={patient?.id} existingAppointment={nextAppointment} onComplete={() => { setShowBooking(false); window.location.reload(); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};