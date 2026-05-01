import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Sidebar } from '../../../Shared/Sidebar';
import { AvatarUpload } from '../../../Dashboards/Patient/AvatarUpload';
import { useDashboardData } from '../../../../hooks/useDashboardData';
import { 
  KeyIcon, 
  DevicePhoneMobileIcon, 
  EnvelopeIcon,
  XMarkIcon, 
  ShieldCheckIcon,
  CakeIcon,
  BriefcaseIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export const SettingsPage = () => {
  // El hook nos trae el perfil del usuario logueado (independiente del rol)
  const { patient: profile } = useDashboardData(); 
  const [userEmail, setUserEmail] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  
  const [newPhone, setNewPhone] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // --- CONFIGURACIÓN POR ROL ---
  const role = profile?.role || 'patient';

  const roleConfig: Record<string, any> = {
    patient: {
      badge: 'Paciente VIP Luminous',
      sinceLabel: 'Santuario desde',
      icon: ShieldCheckIcon,
      showBirthDate: true
    },
    secretary: {
      badge: 'Personal Administrativo',
      sinceLabel: 'Colaborador desde',
      icon: BriefcaseIcon,
      showBirthDate: false
    },
    doctor: {
      badge: 'Cuerpo Médico Luminous',
      sinceLabel: 'Especialista desde',
      icon: UserCircleIcon,
      showBirthDate: false
    },
    admin: {
      badge: 'Administrador del Sistema',
      sinceLabel: 'Gestión desde',
      icon: KeyIcon,
      showBirthDate: false
    }
  };

  const currentConfig = roleConfig[role] || roleConfig.patient;

  useEffect(() => {
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');
    };
    getEmail();
    if (profile?.phone) setNewPhone(profile.phone);
  }, [profile]);

  const handleUpdatePhone = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ phone: newPhone })
      .eq('id', profile.id);

    if (error) return Swal.fire('Error', error.message, 'error');
    
    Swal.fire({
      title: 'Perfil Actualizado',
      text: 'Tu contacto ha sido registrado con éxito.',
      icon: 'success',
      confirmButtonColor: '#4A3737'
    });
    setShowPhoneModal(false);
    window.location.reload();
  };

  const handleUpdatePassword = async () => {
    const result = await Swal.fire({
      title: "¿Confirmar cambio?",
      text: "Esta acción actualizará tu llave de acceso al sistema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4A3737',
      cancelButtonColor: '#F4B6B6',
      background: '#F8F7F4',
      customClass: {
        popup: 'rounded-[3rem] shadow-2xl',
        confirmButton: 'rounded-full px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white',
        cancelButton: 'rounded-full px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-[#4A3737]'
      }
    });

    if (!result.isConfirmed) return;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPass,
    });

    if (signInError) return Swal.fire('Error', 'La contraseña actual es incorrecta.', 'error');

    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) return Swal.fire('Error', error.message, 'error');

    Swal.fire({
      title: 'Acceso Actualizado',
      text: 'Tu contraseña ha sido cambiada.',
      icon: 'success',
      confirmButtonColor: '#4A3737'
    });
    setShowPassModal(false);
    setCurrentPass('');
    setNewPass('');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] overflow-x-hidden w-full max-w-[100vw]">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-4 md:p-12 pt-28 lg:pt-12 bg-[#F8F7F4] min-h-screen w-full relative z-10">
        <div className="max-w-4xl mx-auto space-y-8 lg:space-y-12 animate-fade-in">
          
          {/* HEADER DINÁMICO */}
          <header className="px-2 space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-[#F4B6B6]" />
              <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px] ml-1">Configuración Luminous</p>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif italic text-[#4A3737] leading-none tracking-tighter">
              Mi <span className="text-[#F4B6B6]">Cuenta</span>
            </h1>
          </header>

          <div className="grid grid-cols-1 gap-8 px-2">
            
            {/* SECCIÓN PERFIL CON ROL */}
            <section className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#F4B6B6]/5 rounded-full -mr-20 -mt-20 blur-3xl" />

              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
                <div className="flex-shrink-0">
                  <AvatarUpload 
                    uid={profile?.id} 
                    url={profile?.avatar_url} 
                    onUpload={() => window.location.reload()} 
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <h3 className="text-3xl md:text-5xl font-serif italic text-[#4A3737] leading-tight">
                      {profile?.full_name}
                    </h3>
                    <currentConfig.icon className="w-6 h-6 text-[#F4B6B6]" />
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                    <p className="text-[#F4B6B6] text-[9px] font-black uppercase tracking-[0.2em] bg-[#FCECEC] px-4 py-1.5 rounded-full">
                      {currentConfig.badge}
                    </p>
                    <span className="hidden md:block w-1.5 h-1.5 bg-[#4A3737]/10 rounded-full" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#4A3737]/30">
                      {currentConfig.sinceLabel} {profile?.registration_date ? new Date(profile.registration_date).getFullYear() : '2026'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECCIÓN DATOS Y SEGURIDAD */}
            <section className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-gray-100 shadow-sm space-y-10 text-left">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-8">
                <div className="p-3 bg-[#FCECEC] rounded-2xl text-[#F4B6B6]">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif italic text-[#4A3737]">Información General</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Correo */}
                <div className="space-y-3 px-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#4A3737]/30 ml-4">Identidad Digital</p>
                  <div className="flex items-center gap-4 px-8 py-5 bg-[#F8F7F4] rounded-[2rem] text-sm text-[#4A3737]/60 font-medium">
                    <EnvelopeIcon className="w-5 h-5 text-[#F4B6B6]" />
                    {userEmail}
                  </div>
                </div>

                {/* Cumpleaños (Solo pacientes) */}
                {currentConfig.showBirthDate && (
                  <div className="space-y-3 px-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#4A3737]/30 ml-4">Fecha de Nacimiento</p>
                    <div className="flex items-center gap-4 px-8 py-5 bg-[#F8F7F4] rounded-[2rem] text-sm text-[#4A3737]/60 font-medium">
                      <CakeIcon className="w-5 h-5 text-[#F4B6B6]" />
                      {profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('es-ES', { dateStyle: 'long' }) : 'No registrada'}
                    </div>
                  </div>
                )}

                {/* Teléfono */}
                <div className="space-y-3 px-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#4A3737]/30 ml-4">Contacto Telefónico</p>
                  <div className="flex items-center justify-between px-4 bg-white border border-gray-100 rounded-[2rem] py-2.5 shadow-inner">
                    <span className="text-lg font-serif italic text-[#4A3737] ml-4">{profile?.phone || 'No registrado'}</span>
                    <button 
                      onClick={() => setShowPhoneModal(true)}
                      className="px-6 py-3 bg-[#FCECEC] text-[#F4B6B6] rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#F4B6B6] hover:text-white transition-all active:scale-95"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row gap-4 items-center px-2">
                <button 
                  onClick={() => setShowPassModal(true)}
                  className="flex items-center justify-center gap-3 px-10 py-6 bg-[#4A3737] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F4B6B6] transition-all shadow-xl w-full md:w-auto active:scale-95"
                >
                  <KeyIcon className="w-5 h-5 stroke-[2.5]" />
                  Gestionar Seguridad
                </button>
                <p className="text-[9px] text-[#4A3737]/30 uppercase font-black tracking-widest text-center md:text-left">
                  Última actualización: Hoy
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* MODAL TELÉFONO RESPONSIVE */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#4A3737]/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm shadow-2xl relative border border-white/20">
            <div className="text-left mb-8">
               <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[10px] mb-2">Contacto</p>
               <h4 className="text-3xl font-serif italic text-[#4A3737]">Nuevo Teléfono</h4>
            </div>
            <input 
              type="tel" 
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-8 py-5 bg-[#F8F7F4] border border-gray-100 rounded-full outline-none text-base mb-10 focus:border-[#F4B6B6] shadow-inner font-medium"
              placeholder="10 dígitos"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowPhoneModal(false)} className="flex-1 py-4 text-[9px] font-black uppercase tracking-widest text-[#4A3737]/40 hover:text-[#4A3737] transition-colors">Cancelar</button>
              <button onClick={handleUpdatePhone} className="flex-1 py-5 bg-[#4A3737] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-[#F4B6B6] transition-all">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PASSWORD RESPONSIVE */}
      {showPassModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#4A3737]/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white p-8 md:p-12 rounded-[3.5rem] md:rounded-[4rem] w-full max-w-md shadow-2xl relative border border-white/20">
            <div className="flex justify-between items-start mb-10">
              <div className="text-left">
                <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[10px] mb-2">Llave de Acceso</p>
                <h4 className="text-4xl font-serif italic text-[#4A3737]">Seguridad</h4>
              </div>
              <button onClick={() => setShowPassModal(false)} className="p-4 bg-[#F8F7F4] rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                <XMarkIcon className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
            
            <div className="space-y-8 text-left">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#4A3737]/40 ml-6">Contraseña Actual</label>
                <input 
                  type="password" 
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-8 py-5 bg-[#F8F7F4] border border-gray-100 rounded-full outline-none text-sm focus:border-[#F4B6B6] shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#4A3737]/40 ml-6">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-8 py-5 bg-[#F8F7F4] border border-gray-100 rounded-full outline-none text-sm focus:border-[#F4B6B6] shadow-inner"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <button 
                onClick={handleUpdatePassword}
                className="w-full py-7 bg-[#4A3737] text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-[#F4B6B6] transition-all active:scale-95 mt-4"
              >
                Actualizar Acceso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};