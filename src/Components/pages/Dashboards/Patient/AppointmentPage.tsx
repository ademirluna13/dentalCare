import React from 'react';
import { usePatientHistory } from '../../../../hooks/usePatientHistory';
import { Sidebar } from '../../../Shared/Sidebar';
import { CalendarDaysIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline';

export const AppointmentsPage = () => {
  const { appointments, loading } = usePatientHistory();

  // Agrupación cronológica por Mes/Año
  const groupedAppointments = appointments.reduce((groups: any, app: any) => {
    const date = new Date(app.appointment_date);
    const monthYear = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(app);
    return groups;
  }, {});

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-green-600 bg-green-50 border-green-100';
      case 'cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-[#4A3737]/60 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] overflow-x-hidden w-full max-w-[100vw]">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-32 lg:pt-12 bg-[#F8F7F4] min-h-screen w-full relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* HEADER: COPIA EXACTA DE LA LÍNEA DE "ESTUDIOS" */}
          <header className="px-2 space-y-2">
            
            
            <h1 className="text-5xl md:text-7xl font-serif italic text-[#4A3737] leading-none tracking-tighter">
              Mis <span className="text-[#F4B6B6]">Citas</span>
            </h1>
            
            <p className="text-[#4A3737]/40 uppercase tracking-[0.3em] text-[9px] font-black ml-1">
              Registro cronológico • Evolución Estética • Santuario
            </p>
          </header>

          <hr className="border-[#4A3737]/5 mx-2" />

          {/* CONTENIDO SIN ANIMACIONES */}
          <div className="space-y-12">
            {Object.keys(groupedAppointments).map((monthYear) => (
              <section key={monthYear} className="space-y-6">
                
                {/* Encabezado de Mes Sticky */}
                <h2 className="sticky top-24 z-20 bg-[#F8F7F4]/90 backdrop-blur-md py-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#F4B6B6] border-b border-[#F4B6B6]/10">
                  {monthYear}
                </h2>

                {/* VISTA MÓVIL (CARDS) */}
                <div className="lg:hidden space-y-4 px-2">
                  {groupedAppointments[monthYear].map((app: any) => (
                    <div 
                      key={app.id} 
                      className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-transform"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#FCECEC] rounded-xl text-[#F4B6B6]">
                              <HeartIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-serif text-xl text-[#4A3737]">{app.title}</h3>
                          </div>
                          <div className="flex items-center gap-3 text-[#4A3737]/60 text-xs font-bold uppercase tracking-tight">
                            <ClockIcon className="w-4 h-4 text-[#F4B6B6]" />
                            {new Date(app.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hrs
                            <span className="text-gray-200">|</span>
                            Día {new Date(app.appointment_date).getDate()}
                          </div>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                          {app.status === 'scheduled' ? 'Ok' : 'Fin'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VISTA ESCRITORIO (TABLA REFINADA) */}
                <div className="hidden lg:block bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#4A3737] text-white">
                      <tr>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Servicio</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Protocolo Cronológico</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Estatus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {groupedAppointments[monthYear].map((app: any) => (
                        <tr key={app.id} className="hover:bg-[#F4B6B6]/5 transition-all">
                          <td className="px-10 py-8 font-serif text-2xl text-[#4A3737]">
                            {app.title}
                          </td>
                          <td className="px-10 py-8 text-sm text-[#4A3737]/60 font-medium">
                            {new Date(app.appointment_date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                          </td>
                          <td className="px-10 py-8">
                            <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                              {app.status === 'scheduled' ? 'Confirmada' : 'Completada'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>

          {/* ESTADO VACÍO */}
          {appointments.length === 0 && !loading && (
            <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-[#F4B6B6]/10 mx-2">
              <p className="font-serif italic text-[#4A3737]/30 text-2xl">Bitácora vacía por el momento.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};