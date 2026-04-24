import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import 'sweetalert2/dist/sweetalert2.min.css';

const MySwal = withReactContent(Swal);

export const BookAppointment = ({ patientId, onComplete, existingAppointment }: any) => {
  const [title, setTitle] = useState(existingAppointment?.title || '');
  const [date, setDate] = useState(
    existingAppointment 
      ? new Date(existingAppointment.appointment_date).toLocaleDateString('en-CA') 
      : ''
  );
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. LÓGICA DE SLOTS DINÁMICOS (Calidad Malbitec)
  const availableSlots = useMemo(() => {
    if (!date) return [];
    
    // Usamos getUTCDay para evitar desfases de zona horaria con el input date
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay(); 

    if (dayOfWeek === 0) return []; // Domingo: Cerrado

    const slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
    
    // Si no es sábado (6), agregamos los slots de la tarde hasta las 6 PM
    if (dayOfWeek !== 6) {
      slots.push("16:00", "17:00", "18:00");
    }

    return slots;
  }, [date]);

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA'); 
  const currentTimeStr = now.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  useEffect(() => {
    if (existingAppointment) {
      const d = new Date(existingAppointment.appointment_date);
      const t = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      setSelectedTime(t);
    }
  }, [existingAppointment]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!date) return;
      
      const { data } = await supabase
        .from('appointments')
        .select('appointment_date')
        .gte('appointment_date', `${date}T00:00:00`)
        .lte('appointment_date', `${date}T23:59:59`)
        .neq('status', 'cancelled')
        .neq('id', existingAppointment?.id || '00000000-0000-0000-0000-000000000000');

      if (data) {
        const hours = data.map(app => {
          const d = new Date(app.appointment_date);
          return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        });
        setBookedTimes(hours);
      }
    };

    fetchBookedSlots();
  }, [date, existingAppointment]);

  const handleDateChange = (val: string) => {
    const dayOfWeek = new Date(`${val}T12:00:00`).getDay();
    
    if (dayOfWeek === 0) {
      MySwal.fire({
        title: 'Cerrado',
        text: 'Los domingos descansamos, elige otro dia.',
        icon: 'info',
        confirmButtonColor: '#C5A491'
      });
      return;
    }
    
    setDate(val);
    setSelectedTime(''); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !date) return;

    setLoading(true);
    try {
      const localDateTime = new Date(`${date}T${selectedTime}:00`);
      const isoDateTime = localDateTime.toISOString(); 

      const { error } = await supabase
        .from('appointments')
        .upsert({
          ...(existingAppointment ? { id: existingAppointment.id } : {}),
          patient_id: patientId,
          title: title,
          doctor_name: 'Dr. Alejandro Ruiz',
          appointment_date: isoDateTime,
          status: 'scheduled'
        });

      if (error) throw error;

      await MySwal.fire({
        title: <span className="font-serif italic text-brand-text">¡Cita Agendada!</span>,
        html: <p className="font-sans text-sm text-brand-text/60">Tu espacio en Luminous está listo.</p>,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: 'var(--main-bg)',
        customClass: { popup: 'rounded-[3rem] border border-brand-accent/10 shadow-2xl' }
      });

      onComplete();
    } catch (err: any) {
      MySwal.fire('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3.5rem] border border-brand-accent/20 shadow-2xl animate-fade-in text-brand-text max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-brand-accent/10 rounded-2xl text-brand-accent shadow-inner">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-3xl font-serif italic">{existingAppointment ? 'Reprogramar' : 'Agendar'}</h3>
          <p className="text-[9px] uppercase tracking-[0.2em] text-brand-accent font-bold">Horario de Calidad</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SERVICIO */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40 ml-4">Tratamiento</label>
          <select 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-4 bg-brand-main/50 border border-brand-accent/10 rounded-full outline-none text-sm appearance-none"
            required
          >
            <option value="">Selecciona servicio</option>
            <option value="Limpieza Profunda">Limpieza Profunda</option>
            <option value="Diseño de Sonrisa">Diseño de Sonrisa</option>
            <option value="Consulta de Valoración">Consulta de Valoración</option>
          </select>
        </div>

        {/* FECHA */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40 ml-4">Fecha de visita</label>
          <input 
            type="date" 
            value={date}
            min={todayStr}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-6 py-4 bg-brand-main/50 border border-brand-accent/10 rounded-full outline-none text-sm"
            required
          />
        </div>

        {/* GRID DE HORARIOS DINÁMICO */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40 ml-4 flex items-center gap-2">
            <ClockIcon className="w-3 h-3" /> 
            {date && new Date(`${date}T12:00:00`).getDay() === 6 ? 'Horario Sábado (9am - 3pm)' : 'Horarios Disponibles'}
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => {
                const isBooked = bookedTimes.includes(slot);
                const isPast = (date === todayStr) && (slot <= currentTimeStr);
                const isSelected = selectedTime === slot;
                const isDisabled = isBooked || isPast;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedTime(slot)}
                    className={`
                      py-3 rounded-2xl text-[11px] font-bold transition-all duration-300
                      ${isDisabled 
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-40 border-transparent' 
                        : isSelected 
                          ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/40 scale-105' 
                          : 'bg-white border border-brand-accent/10 text-brand-text hover:border-brand-accent'}
                    `}
                  >
                    {slot}
                  </button>
                );
              })
            ) : (
              <div className="col-span-3 py-6 text-center bg-red-50 rounded-3xl border border-red-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Domingo no laborable</p>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading || !selectedTime || !date}
          className="w-full py-5 bg-brand-text text-white rounded-full font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl hover:bg-brand-accent hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20"
        >
          {loading ? 'Sincronizando...' : (existingAppointment ? 'Confirmar Reprogramación' : 'Agendar Cita')}
        </button>
      </form>
    </div>
  );
};