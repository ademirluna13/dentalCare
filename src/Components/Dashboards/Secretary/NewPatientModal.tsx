import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export const NewPatientModal = ({ isOpen, onClose, onRefresh }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '' // <--- Nueva pieza del rompecabezas
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{ 
            full_name: formData.fullName, 
            email: formData.email, 
            phone: formData.phone,
            birth_date: formData.birthDate, // Guardamos la fecha de nacimiento
            registration_date: new Date().toISOString(), // Fecha de registro manual
            role: 'patient' 
        }]);

      if (error) throw error;

      Swal.fire({
        title: '¡Santuario Actualizado!',
        text: `${formData.fullName} ya es parte de Luminous Clinic.`,
        icon: 'success',
        confirmButtonColor: '#F4B6B6',
        customClass: { popup: 'rounded-[3rem] border border-brand-primary/10 shadow-2xl' }
      });

      onRefresh(); 
      onClose();
      setFormData({ fullName: '', email: '', phone: '', birthDate: '' });
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-dark/20 backdrop-blur-md animate-fade-in">
      <div className="bg-white/90 backdrop-blur-2xl w-full max-w-xl rounded-[3.5rem] border border-brand-primary/20 shadow-2xl p-12 relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-10 right-10 text-brand-dark/20 hover:text-brand-primary transition-colors">
          <XMarkIcon className="w-8 h-8" />
        </button>

        <header className="mb-10 text-center">
          <h2 className="text-4xl font-serif italic text-brand-dark">Nuevo Registro</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mt-2">Expediente Clínico Luminous</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NOMBRE COMPLETO */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-6">Nombre del Paciente</label>
            <div className="relative">
              <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
              <input 
                type="text" 
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full pl-14 pr-8 py-5 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none focus:border-brand-primary transition-all text-sm text-brand-dark"
                placeholder="Ej. Cristofer Alejandro"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CORREO */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-6">Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-14 pr-8 py-5 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none text-sm text-brand-dark"
                  placeholder="paciente@mail.com"
                />
              </div>
            </div>

            {/* TELÉFONO */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-6">Teléfono de Contacto</label>
              <div className="relative">
                <PhoneIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-14 pr-8 py-5 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none text-sm text-brand-dark"
                  placeholder="55-1234-5678"
                />
              </div>
            </div>
          </div>

          {/* FECHA DE NACIMIENTO */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-6">Fecha de Nacimiento</label>
            <div className="relative">
              <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
              <input 
                type="date" 
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className="w-full pl-14 pr-8 py-5 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none focus:border-brand-primary transition-all text-sm text-brand-dark"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-brand-dark text-white rounded-full font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-brand-primary hover:-translate-y-1 active:scale-95 transition-all duration-500 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creando Perfil...' : 'Registrar en el Santuario'}
          </button>
        </form>
      </div>
    </div>
  );
};