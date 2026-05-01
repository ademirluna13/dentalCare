import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { supabase } from '../../../../lib/supabase';
import { NewPatientModal } from '../../../../Components/Dashboards/Secretary/NewPatientModal';
import Swal from 'sweetalert2';
import { 
  ChevronLeftIcon, ChevronRightIcon, 
  XMarkIcon, ClockIcon, PlusIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

export const SecretaryAgenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ date: Date, apps: any[] } | null>(null);
  
  const [isScheduling, setIsScheduling] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [treatmentsList, setTreatmentsList] = useState<any[]>([]);
  
  const [formPatientId, setFormPatientId] = useState('');
  const [formTime, setFormTime] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const resetForm = () => {
    setFormPatientId('');
    setFormTime('');
    setSelectedTreatments([]);
    setIsSubmitting(false);
  };

  const fetchMonthAppointments = async () => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*, profiles(full_name)')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date', { ascending: true });
    
    if (!error && data) setAppointments(data);
    setLoading(false);
  };

  useEffect(() => { fetchMonthAppointments(); }, [currentDate]);

  const loadFormData = async () => {
    const { data: p } = await supabase.from('profiles').select('id, full_name').eq('role', 'patient').order('full_name', { ascending: true });
    const { data: t } = await supabase.from('services_catalog').select('*').order('name', { ascending: true });
    if (p) setPatientsList(p);
    if (t) setTreatmentsList(t);
  };

  useEffect(() => { 
    if (isScheduling) loadFormData(); 
  }, [isScheduling]);

  const addTreatment = (treatmentName: string) => {
    const treatment = treatmentsList.find(t => t.name === treatmentName);
    if (treatment && !selectedTreatments.find(st => st.id === treatment.id)) {
      setSelectedTreatments([...selectedTreatments, treatment]);
    }
  };

  const removeTreatment = (id: string) => {
    setSelectedTreatments(selectedTreatments.filter(t => t.id !== id));
  };

  const getAppointmentsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(app => app.appointment_date.startsWith(dateString));
  };

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientId || selectedTreatments.length === 0 || !formTime) {
        return Swal.fire({ title: 'Datos faltantes', text: 'Debes seleccionar paciente, tratamiento y hora.', icon: 'warning', confirmButtonColor: '#4A3737', background: '#F8F7F4' });
    }

    setIsSubmitting(true);
    const [hours, minutes] = formTime.split(':');
    const appointmentDate = new Date(selectedDayInfo!.date);
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    try {
      const { error } = await supabase.from('appointments').insert([{
        patient_id: formPatientId,
        title: selectedTreatments.map(t => t.name).join(', '),
        appointment_date: appointmentDate.toISOString(),
        status: 'scheduled'
      }]);

      if (error) throw error;
      await Swal.fire({ icon: 'success', title: 'Agendado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      resetForm();
      setIsScheduling(false); 
      setSelectedDayInfo(null); 
      fetchMonthAppointments();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo guardar la cita.', icon: 'error', confirmButtonColor: '#4A3737', background: '#F8F7F4' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- REGLAS DE NEGOCIO ---
  const isDayBlocked = (checkDate: Date) => {
    const isPastDay = checkDate < today;
    const isSunday = checkDate.getDay() === 0;
    
    // Si es hoy, revisar si ya pasó la hora de cierre
    let isTodayClosed = false;
    if (checkDate.toLocaleDateString('en-CA') === now.toLocaleDateString('en-CA')) {
      const isSaturday = checkDate.getDay() === 6;
      const closingHour = isSaturday ? 15 : 18;
      if (now.getHours() >= closingHour) {
        isTodayClosed = true;
      }
    }
    return isPastDay || isSunday || isTodayClosed;
  };

  const getAvailableHoursForDay = (date: Date) => {
    const isSaturday = date.getDay() === 6;
    // Sábado: 9:00 a 14:00 (cierra a las 15:00). L-V: 9:00 a 17:00 (cierra a las 18:00)
    const hours = isSaturday 
      ? ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"]
      : ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    return hours;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] w-full">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12 pt-28 lg:pt-16 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 animate-fade-in text-[#4A3737]">
          
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-2">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-[#F4B6B6]" />
                <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px]">Luminous Ecosystem</p>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-none">Agenda <span className="text-[#F4B6B6]">General</span></h1>
            </div>
            <button onClick={() => { setCurrentDate(new Date()); resetForm(); }} className="px-8 py-4 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:border-[#F4B6B6] shadow-sm transition-all active:scale-95">Mes Actual</button>
          </header>

          <section className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-xl border border-gray-50 overflow-hidden">
            {/* Navegación del Mes */}
            <div className="p-6 md:p-10 flex justify-between items-center bg-[#FCECEC]/10 border-b border-gray-50">
              <h2 className="text-3xl md:text-5xl font-serif italic capitalize">{monthNames[month]} <span className="text-gray-200 ml-1 font-light">{year}</span></h2>
              <div className="flex gap-2 md:gap-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:bg-[#FCECEC] transition-all"><ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5 stroke-[3]" /></button>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border border-gray-100 hover:bg-[#FCECEC] transition-all"><ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 stroke-[3]" /></button>
              </div>
            </div>

            {/* Días de la Semana */}
            <div className="grid grid-cols-7 text-center py-4 md:py-6 border-b border-gray-50 bg-[#F8F7F4]/30">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div key={i} className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                  <span className="hidden sm:inline">{['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][i]}</span>
                  <span className="sm:hidden">{day}</span>
                </div>
              ))}
            </div>

            {/* Grid del Calendario */}
            <div className="grid grid-cols-7 min-w-full">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`b-${i}`} className="aspect-square md:min-h-[140px] border-[0.5px] border-gray-50 bg-[#F8F7F4]/20"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayApps = getAppointmentsForDay(day);
                const checkDate = new Date(year, month, day);
                const isToday = checkDate.toLocaleDateString('en-CA') === now.toLocaleDateString('en-CA');
                
                // APLICAR REGLAS DE NEGOCIO AL DÍA
                const blocked = isDayBlocked(checkDate);

                return (
                  <div key={day} 
                       onClick={() => { 
                         setSelectedDayInfo({ date: checkDate, apps: dayApps }); 
                         resetForm(); 
                         setIsScheduling(false); 
                       }} 
                       className={`aspect-square md:min-h-[140px] p-2 md:p-6 border-[0.5px] border-gray-50 transition-all cursor-pointer relative group overflow-hidden
                        ${isToday ? 'bg-[#FCECEC]/30 border-[#F4B6B6]' : 'bg-white hover:bg-[#F8F7F4]/50'}
                        ${blocked ? 'opacity-50 grayscale' : ''}`}>
                    
                    <div className="flex justify-between items-start relative z-10">
                      <span className={`text-sm md:text-lg font-black transition-colors ${isToday ? 'text-[#F4B6B6]' : blocked ? 'text-gray-300' : 'text-gray-400 group-hover:text-[#4A3737]'}`}>
                        {day}
                      </span>
                      {dayApps.length > 0 && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#F4B6B6] rounded-full" />}
                    </div>

                    {/* Indicador de Bloqueo / Día Pasado */}
                    {blocked && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80">
                         <NoSymbolIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}

                    {/* Desktop: Mostrar Nombres (Si no está bloqueado) */}
                    {!blocked && (
                      <div className="mt-2 space-y-1 hidden md:block">
                        {dayApps.slice(0, 2).map((a, idx) => (
                          <div key={idx} className="px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                            <p className="text-[8px] font-black uppercase truncate text-[#4A3737]">{a.profiles?.full_name?.split(' ')[0]}</p>
                          </div>
                        ))}
                        {dayApps.length > 2 && <p className="text-[8px] font-bold text-[#F4B6B6] pl-1">+{dayApps.length - 2} citas</p>}
                      </div>
                    )}

                    {/* Móvil: Mostrar Contador */}
                    <div className="md:hidden absolute bottom-2 right-2">
                       {dayApps.length > 0 && <span className="text-[9px] font-black text-gray-300">{dayApps.length}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Modal de Detalle / Agendado (Responsive Machinsote) */}
        {selectedDayInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-[#4A3737]/80 backdrop-blur-xl animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] md:rounded-[4rem] shadow-2xl overflow-hidden relative border border-white/20">
              
              <div className="p-8 md:p-12 border-b border-gray-50 flex justify-between items-center bg-[#FCECEC]/20">
                <div className="text-left">
                  <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px] mb-1">
                    {isScheduling ? 'Formulario de' : 'Revisión de'}
                  </p>
                  <h3 className="text-2xl md:text-4xl font-serif italic text-[#4A3737]">
                    {isScheduling ? 'Nueva Cita' : selectedDayInfo.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </h3>
                </div>
                <button onClick={() => { setSelectedDayInfo(null); resetForm(); }} className="p-3 md:p-4 bg-white rounded-2xl text-gray-300 hover:text-rose-500 shadow-xl transition-all active:scale-90"><XMarkIcon className="w-6 h-6 stroke-[3]" /></button>
              </div>

              <div className="p-8 md:p-12 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {isScheduling ? (
                  <form onSubmit={handleScheduleAppointment} className="space-y-6 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                      <div className="space-y-2 text-left">
                        <label className="text-[9px] font-black uppercase text-gray-300 ml-4 tracking-[0.2em]">Paciente</label>
                        <select required value={formPatientId} onChange={(e) => setFormPatientId(e.target.value)} className="w-full p-5 md:p-6 bg-[#F8F7F4] border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] text-sm font-medium outline-none focus:border-[#F4B6B6] appearance-none transition-all text-[#4A3737]">
                          <option value="">Seleccionar...</option>
                          {patientsList.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[9px] font-black uppercase text-gray-300 ml-4 tracking-[0.2em]">Servicio</label>
                        <select onChange={(e) => addTreatment(e.target.value)} value="" className="w-full p-5 md:p-6 bg-[#F8F7F4] border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] text-sm font-medium outline-none focus:border-[#F4B6B6] appearance-none transition-all text-[#4A3737]">
                          <option value="">Buscar servicio...</option>
                          {treatmentsList.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {selectedTreatments.length > 0 && (
                      <div className="p-6 bg-[#F8F7F4] rounded-[2rem] flex flex-wrap gap-2 md:gap-3 border border-gray-50 shadow-inner">
                        {selectedTreatments.map(t => (
                          <div key={t.id} className="flex items-center gap-3 px-4 py-2 bg-white text-[#4A3737] rounded-xl border border-gray-50 text-[9px] font-black uppercase tracking-widest shadow-sm">
                            {t.name} <button type="button" onClick={() => removeTreatment(t.id)}><XMarkIcon className="w-3.5 h-3.5 text-rose-300 hover:text-rose-500"/></button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-4 text-left">
                      <label className="text-[9px] font-black uppercase text-gray-300 ml-4 tracking-[0.2em]">Horarios Disponibles</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
                        {/* APLICAR REGLAS DE HORAS POR DÍA */}
                        {getAvailableHoursForDay(selectedDayInfo.date).map(hour => {
                          const slotHour = parseInt(hour.split(':')[0]);
                          const isTaken = selectedDayInfo.apps.some(app => new Date(app.appointment_date).getHours() === slotHour);
                          
                          // Regla: Si es hoy, deshabilitar horas pasadas
                          const isToday = selectedDayInfo.date.toLocaleDateString('en-CA') === now.toLocaleDateString('en-CA');
                          const isPastHour = isToday && slotHour <= now.getHours();
                          
                          const disabled = isTaken || isPastHour;

                          return (
                            <button key={hour} type="button" disabled={disabled} onClick={() => setFormTime(hour)} 
                              className={`py-4 rounded-xl text-[10px] font-black transition-all border shadow-sm ${disabled ? 'bg-gray-50 text-gray-200 line-through opacity-40 cursor-not-allowed border-transparent' : formTime === hour ? 'bg-[#4A3737] text-white shadow-xl scale-105 border-[#4A3737]' : 'bg-white text-[#4A3737] hover:border-[#F4B6B6]'}`}>
                              {hour}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <button type="submit" disabled={isSubmitting || !formTime || selectedTreatments.length === 0} className="w-full py-6 md:py-7 bg-[#4A3737] text-[#F4B6B6] rounded-[2rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] md:text-[12px] hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all shadow-2xl active:scale-95 disabled:opacity-30">
                        {isSubmitting ? 'AGENDANDO...' : 'CONFIRMAR AGENDADO'}
                        </button>
                        <button type="button" onClick={() => setIsScheduling(false)} className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[#4A3737] transition-colors py-4">Volver a la lista</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8 text-center">
                    {/* Botón de Agendar (Se oculta si el día está bloqueado por reglas de negocio) */}
                    {!isDayBlocked(selectedDayInfo.date) ? (
                        <button onClick={() => setIsScheduling(true)} className="w-full p-10 md:p-12 border-2 border-dashed border-[#F4B6B6]/30 rounded-[3rem] text-[#F4B6B6] hover:bg-[#FCECEC]/50 hover:border-[#F4B6B6] transition-all flex flex-col items-center gap-4 group">
                        <div className="p-4 bg-[#FCECEC] rounded-2xl group-hover:scale-110 group-hover:bg-[#F4B6B6] group-hover:text-white transition-all"><PlusIcon className="w-8 h-8 md:w-10 md:h-10 stroke-[2.5]" /></div>
                        <span className="font-serif italic text-2xl md:text-3xl text-[#4A3737]">Agendar Cita</span>
                        </button>
                    ) : (
                        <div className="w-full p-10 border border-gray-100 bg-gray-50 rounded-[3rem] flex flex-col items-center gap-2">
                           <NoSymbolIcon className="w-8 h-8 text-gray-300" />
                           <p className="text-xs font-black uppercase tracking-widest text-gray-400">Día no disponible para agendar</p>
                        </div>
                    )}

                    <div className="space-y-4 text-left">
                      <p className="text-[9px] font-black uppercase text-gray-300 ml-4 tracking-[0.2em]">Citas Programadas</p>
                      {selectedDayInfo.apps.length > 0 ? selectedDayInfo.apps.map((app) => (
                        <div key={app.id} className="flex flex-col sm:flex-row gap-4 md:gap-6 p-6 md:p-8 rounded-[2rem] border border-gray-50 bg-[#F8F7F4]/50 shadow-sm relative overflow-hidden group hover:bg-white hover:shadow-xl transition-all">
                          <div className="absolute left-0 top-0 w-1.5 h-full bg-[#F4B6B6]" />
                          <div className="flex items-center gap-4 sm:flex-col sm:justify-center sm:px-6 sm:border-r border-gray-100">
                            <ClockIcon className="w-5 h-5 text-[#F4B6B6]" />
                            <span className="text-[11px] font-black text-[#4A3737]">{new Date(app.appointment_date).getHours().toString().padStart(2, '0')}:00</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-serif italic text-2xl md:text-3xl text-[#4A3737] leading-none mb-2">{app.profiles?.full_name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{app.title}</p>
                          </div>
                        </div>
                      )) : <div className="text-center py-10 font-serif italic text-gray-300 text-xl md:text-2xl">Sin citas registradas.</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <NewPatientModal isOpen={isNewPatientModalOpen} onClose={() => setIsNewPatientModalOpen(false)} onRefresh={loadFormData} />
      </main>
    </div>
  );
};