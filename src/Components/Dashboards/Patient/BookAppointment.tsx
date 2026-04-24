import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

export const BookAppointment = ({ patientId, onComplete }: any) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullDateTime = `${date}T${time}:00`;
      
      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: patientId,
          title: title,
          doctor_name: 'Dr. Alejandro Ruiz', // Por ahora fijo, luego puede ser dinámico
          appointment_date: fullDateTime,
          status: 'scheduled'
        }]);

      if (error) throw error;

      alert("¡Cita agendada, mi pa! Te esperamos en el santuario.");
      onComplete(); // Recarga la data del dashboard
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-brand-primary/20 shadow-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon className="w-6 h-6 text-brand-primary" />
        <h3 className="text-2xl font-serif italic text-brand-dark">Agendar Nueva Cita</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Servicio</label>
          <select 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-3 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none focus:border-brand-primary text-sm"
            required
          >
            <option value="">Selecciona un servicio</option>
            <option value="Limpieza Profunda">Limpieza Profunda</option>
            <option value="Blanqueamiento Pro">Blanqueamiento Pro</option>
            <option value="Diseño de Sonrisa">Diseño de Sonrisa</option>
            <option value="Consulta de Valoración">Consulta de Valoración</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Fecha</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-6 py-3 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none focus:border-brand-primary text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Hora</label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-6 py-3 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none focus:border-brand-primary text-sm"
              required
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full py-4 bg-brand-dark text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-brand-primary transition-all disabled:opacity-50"
        >
          {loading ? 'Confirmando...' : 'Confirmar Cita'}
        </button>
      </form>
    </div>
  );
};