import React, { useState } from 'react';
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
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const MySwal = withReactContent(Swal);

export const PatientDashboard = () => {
  const { patient, nextAppointment, payments, studies, loading } = useDashboardData();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);

  const handleCancel = async () => {
    if (!nextAppointment) return;

    const result = await MySwal.fire({
      title: <span className="font-serif italic text-brand-dark">¿Deseas cancelar?</span>,
      html: <p className="text-sm text-brand-dark/60 font-sans">Esta acción liberará tu espacio en el santuario.</p>,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      confirmButtonColor: '#C5A491',
      cancelButtonColor: '#2C2C2C',
      background: '#F8F5F2',
      customClass: {
        popup: 'rounded-[3rem] border border-brand-primary/20 shadow-2xl',
        confirmButton: 'rounded-full px-8 py-3 text-[10px] font-bold uppercase tracking-widest',
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

  if (loading) return (
    <div className="h-screen bg-[#F9DFDF] flex flex-col items-center justify-center">
      <ArrowPathIcon className="w-12 h-12 text-brand-primary animate-spin mb-4" />
      <p className="font-serif italic text-brand-dark">Sincronizando santuario...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F9DFDF]"> 
      <Sidebar />
      
      <main className="flex-1 ml-72 p-12 bg-[#FAF7F5] bg-grain min-h-screen rounded-l-[4rem] shadow-2xl relative z-10">
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
          
          {/* 1. HEADER SUPREME - FOTO GIGANTE Y CIRCULAR */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            <header className="lg:col-span-3 flex items-center gap-10 p-10 bg-white/40 rounded-[4rem] border border-brand-primary/10 backdrop-blur-md shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative flex-shrink-0">
                <div className="w-44 h-44 rounded-full overflow-hidden border-8 border-white shadow-2xl relative z-10">
                  {patient?.avatar_url ? (
                    <img src={patient.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-6xl font-serif">
                      {patient?.full_name?.[0]}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-brand-primary text-white p-2.5 rounded-2xl shadow-lg border-4 border-white z-20">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-3 flex-1 z-10">
                <h1 className="text-6xl font-serif text-brand-dark leading-none">
                  Hola, {patient?.full_name?.split(' ')[0]}
                </h1>
                <p className="text-brand-dark/50 font-sans font-light text-lg">Bienvenido a tu santuario dental.</p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary bg-brand-primary/5 px-4 py-1.5 rounded-full border border-brand-primary/10">
                  Paciente VIP Luminous
                </span>
              </div>
            </header>

            {/* QUICK STATS - CON HORARIO INCLUIDO */}
            <div className="bg-brand-dark p-10 rounded-[3.5rem] text-white flex flex-col justify-center shadow-2xl relative overflow-hidden group">
              <p className="text-[9px] font-bold uppercase tracking-widest text-brand-primary mb-1">Próxima Visita</p>
              {nextAppointment ? (
                <div className="space-y-1">
                  <p className="text-4xl font-serif italic text-white leading-none">
                    {new Date(nextAppointment.appointment_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary/80">
                    {new Date(nextAppointment.appointment_date).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })} hrs
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-serif italic text-white/40">Sin agenda</p>
              )}
              <CalendarIcon className="absolute -right-5 -bottom-5 w-24 h-24 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
            </div>

            <div className="bg-white/60 backdrop-blur-md p-10 rounded-[3.5rem] border border-brand-primary/10 flex flex-col justify-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 mb-1">Biblioteca</p>
              <p className="text-3xl font-serif text-brand-dark leading-none">{studies?.length || 0}</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-brand-dark/60 mt-1">Documentos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* IZQUIERDA: CITAS Y PAGOS */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3.5rem] border border-brand-primary/10 shadow-xl flex justify-between items-center px-10">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary shadow-inner">
                    <CalendarIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif italic text-brand-dark">Detalles de Cita</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-brand-dark/60">{nextAppointment?.title || 'No hay citas agendadas'}</p>
                      {nextAppointment && (
                        <>
                          <span className="w-1 h-1 bg-brand-dark/20 rounded-full" />
                          <p className="text-sm font-bold text-brand-primary">
                            {new Date(nextAppointment.appointment_date).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  {nextAppointment && (
                    <button onClick={handleCancel} className="px-8 py-4 border border-brand-primary/10 text-brand-dark/30 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-red-50 hover:text-red-400 transition-all">
                      Cancelar
                    </button>
                  )}
                  <button onClick={() => setShowBooking(true)} className="px-10 py-4 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg hover:scale-105 transition-all">
                    {nextAppointment ? 'Reprogramar' : 'Agendar'}
                  </button>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] border border-brand-primary/10 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary shadow-inner">
                    <CreditCardIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif italic text-brand-dark">Mis Pagos</h3>
                </div>
                <div className="space-y-4">
                  {payments.length > 0 ? payments.slice(0, 3).map((p: any) => (
                    <PaymentRow key={p.id} title={p.description} date={new Date(p.created_at).toLocaleDateString()} amount={p.amount} status={p.status} />
                  )) : <p className="text-center py-4 text-brand-dark/20 text-[10px] font-bold uppercase tracking-widest">Sin transacciones</p>}
                </div>
              </div>
            </div>

            {/* DERECHA: EVOLUCIÓN */}
            <div className="lg:col-span-4 h-full">
              <div className="bg-brand-dark p-10 rounded-[3.5rem] border border-brand-primary/20 shadow-2xl h-full">
                <div className="flex items-center gap-3 mb-10 text-white">
                  <HeartIcon className="w-6 h-6 text-brand-primary" />
                  <h3 className="text-2xl font-serif italic">Tu Evolución</h3>
                </div>
                <div className="space-y-10 relative">
                  <div className="absolute left-3 top-2 bottom-2 w-[1px] bg-brand-primary/20" />
                  <TimelineStep title="Fase Inicial" status="Completado" active={true} progress={100} />
                  <TimelineStep title="Fase Actual" status="En proceso" active={true} progress={patient?.treatment_progress || 45} />
                </div>
              </div>
            </div>
          </div>

          {/* REPOSITORIO DINÁMICO */}
          <div className="space-y-8 pt-4">
            <div className="flex justify-between items-end px-4">
              <h3 className="text-4xl font-serif italic text-brand-dark">Repositorio</h3>
              <button onClick={() => navigate('/dashboard/estudios')} className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Ver todo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {studies.slice(0, 3).map((s: any) => (
                <a key={s.id} href={s.file_url} target="_blank" rel="noreferrer">
                  <FileCard title={s.title} info={s.file_type.toUpperCase()} icon={s.file_type === 'pdf' ? '📄' : '🦷'} />
                </a>
              ))}
              <div onClick={() => navigate('/dashboard/estudios')} className="border-2 border-dashed border-brand-primary/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-primary/5 transition-all">
                <DocumentIcon className="w-6 h-6 text-brand-primary mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Gestionar</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-dark/40 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full relative">
            <button onClick={() => setShowBooking(false)} className="absolute -top-12 right-0 text-white hover:text-brand-primary transition-colors flex items-center gap-2 group">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Cerrar</span>
              <XMarkIcon className="w-10 h-10" />
            </button>
            <BookAppointment patientId={patient?.id} existingAppointment={nextAppointment} onComplete={() => { setShowBooking(false); window.location.reload(); }} />
          </div>
        </div>
      )}
    </div>
  );
};