import React, { useState } from 'react';
import { Sidebar } from '../../Shared/Sidebar';
import { PaymentRow } from '../../Dashboards/Patient/PaymentRow';
import { TimelineStep } from '../../Dashboards/Patient/TimelineStep';
import { FileCard } from '../../Dashboards/Patient/FileCard';
import { AvatarUpload } from '../../Dashboards/Patient/AvatarUpload';
import { BookAppointment } from '../../Dashboards/Patient/BookAppointment'; 
import { useDashboardData } from '../../../hooks/useDashboardData';
import { 
  CalendarIcon, 
  CreditCardIcon, 
  HeartIcon, 
  ArrowPathIcon,
  DocumentIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export const PatientDashboard = () => {
  const { patient, nextAppointment, payments, loading } = useDashboardData();
  const [showBooking, setShowBooking] = useState(false);

  const handleAvatarUpdate = () => {
    window.location.reload(); 
  };

  if (loading) return (
    <div className="h-screen bg-brand-neutral flex flex-col items-center justify-center">
      <ArrowPathIcon className="w-12 h-12 text-brand-primary animate-spin mb-4" />
      <p className="font-serif italic text-brand-dark">Sincronizando santuario...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-brand-neutral bg-grain text-brand-dark">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
          
          {/* 1. HEADER CON FOTO Y SALUDO PERSONALIZADO */}
          <header className="flex items-center gap-10 p-10 bg-white/40 rounded-[3.5rem] border border-brand-primary/10 backdrop-blur-sm shadow-inner shadow-brand-primary/5">
            <AvatarUpload 
              uid={patient?.id} 
              url={patient?.avatar_url} 
              onUpload={handleAvatarUpdate} 
            />

            <div className="space-y-3 flex-1">
              <h1 className="text-6xl font-serif text-brand-dark leading-none">
                Hola, {patient?.full_name?.split(' ')[0] || 'Ademir'}
              </h1>
              <p className="text-brand-dark/50 font-sans font-light text-lg max-w-xl">
                Bienvenido a tu portal de bienestar. Tu salud dental está en las mejores manos.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2 space-y-8">
              {/* 2. CARD PRÓXIMA CITA (CORREGIDA PARA MOSTRAR DETALLES) */}
              <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] border border-brand-primary/10 shadow-xl shadow-brand-primary/5">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-serif italic text-brand-dark">Mi Próxima Cita</h3>
                  </div>
                  {nextAppointment && (
                    <div className="text-right">
                      <p className="text-4xl font-serif text-brand-primary italic leading-none">
                        {new Date(nextAppointment.appointment_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary/60 mt-1">
                        {new Date(nextAppointment.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hrs
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xl font-serif text-brand-dark">
                      {nextAppointment?.title || 'Sin citas pendientes'}
                    </p>
                    {nextAppointment && (
                       <p className="text-[10px] font-sans text-brand-dark/40 uppercase tracking-widest mt-1">
                         Con: {nextAppointment.doctor_name}
                       </p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setShowBooking(true)}
                    className="px-6 py-3 bg-brand-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-lg hover:scale-105 transition-all"
                  >
                    Agendar / Reprogramar
                  </button>
                </div>
              </div>

              {/* 3. MIS PAGOS */}
              <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] border border-brand-primary/10 shadow-xl shadow-brand-primary/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <CreditCardIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif italic text-brand-dark">Mis Pagos</h3>
                </div>
                <div className="space-y-4">
                  {payments.length > 0 ? (
                    payments.map((p: any) => (
                      <PaymentRow 
                        key={p.id} 
                        title={p.description} 
                        date={new Date(p.created_at).toLocaleDateString()} 
                        amount={p.amount} 
                        status={p.status} 
                      />
                    ))
                  ) : (
                    <p className="text-center text-brand-dark/20 font-sans text-[10px] uppercase tracking-widest py-4">No hay transacciones registradas</p>
                  )}
                </div>
              </div>
            </div>

            {/* 4. PLAN DE TRATAMIENTO */}
            <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3.5rem] border border-brand-primary/20 shadow-2xl shadow-brand-primary/5">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                  <HeartIcon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif italic text-brand-dark">Evolución</h3>
              </div>
              <div className="space-y-10 relative">
                <div className="absolute left-3 top-2 bottom-2 w-[1px] bg-brand-primary/20" />
                <TimelineStep 
                  title="Progreso General" 
                  status="En camino a tu mejor sonrisa" 
                  active={true} 
                  progress={patient?.treatment_progress || 0} 
                />
              </div>
            </div>
          </div>

          {/* 5. REPOSITORIO */}
          <div className="space-y-8 pt-8">
            <h3 className="text-4xl font-serif italic text-brand-dark">Repositorio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileCard title="Radiografía Panorámica" info="PDF • 2.4 MB" icon="🦷" />
              <FileCard title="Fotografías Clínicas" info="ZIP • 15 MB" icon="📷" />
              <div className="border-2 border-dashed border-brand-primary/30 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center hover:bg-brand-primary/5 transition-all cursor-pointer group">
                <DocumentIcon className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Subir nuevo documento</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MODAL DE AGENDADO */}
      {showBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-dark/40 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full relative">
            <button 
              onClick={() => setShowBooking(false)}
              className="absolute -top-12 right-0 text-white hover:text-brand-primary transition-colors flex items-center gap-2 group"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Cerrar</span>
              <XMarkIcon className="w-10 h-10" />
            </button>

            <BookAppointment 
              patientId={patient?.id} 
              onComplete={() => {
                setShowBooking(false);
                window.location.reload(); 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};