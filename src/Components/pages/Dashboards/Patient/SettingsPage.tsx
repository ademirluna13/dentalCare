import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Sidebar } from '../../../Shared/Sidebar';
import { AvatarUpload } from '../../../Dashboards/Patient/AvatarUpload';
import { useDashboardData } from '../../../../hooks/useDashboardData';
import { 
  UserCircleIcon, 
  KeyIcon, 
  DevicePhoneMobileIcon, 
  EnvelopeIcon,
  XMarkIcon, 
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export const SettingsPage = () => {
  const { patient } = useDashboardData();
  const [userEmail, setUserEmail] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  
  // Datos para los modales
  const [newPhone, setNewPhone] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  useEffect(() => {
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');
    };
    getEmail();
    if (patient?.phone) setNewPhone(patient.phone);
  }, [patient]);

  const handleUpdatePhone = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ phone: newPhone })
      .eq('id', patient.id);

    if (error) return Swal.fire('Error', error.message, 'error');
    
    Swal.fire('¡Santuario Actualizado!', 'Tu teléfono ha sido registrado.', 'success');
    setShowPhoneModal(false);
    window.location.reload();
  };

  const handleUpdatePassword = async () => {
    // Para hacerlo "perrote", intentamos loguearnos con la clave actual primero
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPass,
    });

    if (signInError) {
      return Swal.fire('Error de Verificación', 'La contraseña actual no es correcta.', 'error');
    }

    const { error } = await supabase.auth.updateUser({ password: newPass });
    
    if (error) return Swal.fire('Error', error.message, 'error');

    Swal.fire('Seguridad Reforzada', 'Tu contraseña ha sido cambiada.', 'success');
    setShowPassModal(false);
    setCurrentPass('');
    setNewPass('');
  };

  return (
    <div className="flex min-h-screen bg-brand-neutral bg-grain">
      <Sidebar />
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
          
          <header>
            <h1 className="text-6xl font-serif italic text-brand-dark leading-none">Mi Configuración</h1>
            <p className="text-brand-dark/40 uppercase tracking-widest text-[10px] font-bold mt-4">Gestión de identidad y seguridad</p>
          </header>

          <div className="grid grid-cols-1 gap-8">
            
           {/* PERFIL Y FOTO: Versión Optimizada */}
            <section className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-brand-primary/10 shadow-xl relative overflow-hidden group">
            {/* Fondo decorativo sutil para quitar lo "plano" */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-primary/10 transition-colors" />

            <div className="flex items-center gap-8 relative z-10">
                {/* Contenedor de la Foto con tamaño ajustado */}
                <div className="flex-shrink-0">
                <AvatarUpload 
                    uid={patient?.id} 
                    url={patient?.avatar_url} 
                    onUpload={() => window.location.reload()} 
                />
                </div>

                {/* Información agrupada y con jerarquía */}
                <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-serif italic text-brand-dark leading-tight">
                    {patient?.full_name}
                    </h3>
                    {/* Badge discreto de verificado */}
                    <div className="p-1 bg-brand-primary/10 rounded-full">
                    <ShieldCheckIcon className="w-4 h-4 text-brand-primary" />
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <p className="text-brand-primary text-[10px] font-bold uppercase tracking-[0.2em] bg-brand-primary/5 px-3 py-1 rounded-lg">
                    Paciente VIP Luminous
                    </p>
                    <span className="w-1 h-1 bg-brand-dark/20 rounded-full" />
                    <p className="text-[10px] font-medium uppercase tracking-widest text-brand-dark/40">
                    Miembro desde {new Date(patient?.created_at).getFullYear() || '2026'}
                    </p>
                </div>
                </div>

                {/* Acción rápida (Opcional, para llenar el hueco derecho con utilidad) */}
                <div className="hidden md:block pr-4">
                    <p className="text-[9px] font-bold uppercase tracking-tighter text-brand-dark/20 text-right mb-1">Estatus del Santuario</p>
                    <div className="flex items-center gap-2 text-green-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Cuenta Activa</span>
                    </div>
                </div>
            </div>
            </section>

            {/* CONTACTO */}
            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[4rem] border border-brand-primary/10 shadow-xl space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-6">
                <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                  <DevicePhoneMobileIcon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif italic text-brand-dark">Datos de Contacto</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 ml-2">Correo Electrónico</p>
                  <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-full border border-transparent text-sm text-brand-dark/50">
                    <EnvelopeIcon className="w-4 h-4" />
                    {userEmail}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 ml-2">Teléfono</p>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-lg font-medium text-brand-dark">{patient?.phone || 'Sin registro'}</span>
                    <button 
                      onClick={() => setShowPhoneModal(true)}
                      className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:underline"
                    >
                      Cambiar Teléfono
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowPassModal(true)}
                className="flex items-center gap-2 px-8 py-4 bg-brand-dark text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-primary transition-all shadow-lg"
              >
                <KeyIcon className="w-4 h-4" />
                Seguridad y Contraseña
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* MODAL TELÉFONO */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-brand-dark/60 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm shadow-2xl relative">
            <h4 className="text-2xl font-serif italic mb-6">Actualizar Teléfono</h4>
            <input 
              type="tel" 
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-6 py-4 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none text-sm mb-6"
              placeholder="5512345678"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowPhoneModal(false)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Cancelar</button>
              <button onClick={handleUpdatePhone} className="flex-1 py-4 bg-brand-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PASSWORD (EL PERROTE) */}
      {showPassModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-brand-dark/60 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <h4 className="text-3xl font-serif italic text-brand-dark">Cambiar Seguridad</h4>
              <button onClick={() => setShowPassModal(false)}><XMarkIcon className="w-6 h-6 text-brand-dark/20" /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Contraseña Actual</label>
                <input 
                  type="password" 
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-6 py-4 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-6 py-4 bg-brand-neutral/50 border border-brand-primary/10 rounded-full outline-none text-sm"
                />
              </div>
              <button 
                onClick={handleUpdatePassword}
                className="w-full py-5 bg-brand-dark text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-brand-primary transition-all"
              >
                Verificar y Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};