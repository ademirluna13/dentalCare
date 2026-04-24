import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  UserIcon, 
  CalendarIcon, 
  HeartIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  PhoneIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { isConfirmed } = await Swal.fire({
      title: <span className="font-serif italic text-[#4A3737]">¿Te retiras del santuario?</span>,
      text: "Tendrás que volver a iniciar sesión para ver tu progreso.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Mantenerme aquí',
      confirmButtonColor: '#4A3737', // Ajustado al nuevo tono
      cancelButtonColor: '#C5A491',
      background: '#F9DFDF',
      customClass: {
        popup: 'rounded-[3rem] border border-white/20 shadow-2xl',
        confirmButton: 'rounded-full px-8 py-3 text-[10px] font-bold uppercase tracking-widest',
        cancelButton: 'rounded-full px-8 py-3 text-[10px] font-bold uppercase tracking-widest'
      }
    });

    if (isConfirmed) {
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  const menuItems = [
    { name: 'Mi Perfil', icon: UserIcon, path: '/dashboard' },
    { name: 'Mis Citas', icon: CalendarIcon, path: '/dashboard/citas' },
    { name: 'Mi Tratamiento', icon: HeartIcon, path: '/dashboard/tratamiento' },
    { name: 'Mis Estudios', icon: DocumentTextIcon, path: '/dashboard/estudios' },
    { name: 'Mis Pagos', icon: CreditCardIcon, path: '/dashboard/pagos' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#F9DFDF] border-r border-brand-primary/10 p-10 flex flex-col z-50 overflow-hidden">
      
      {/* BRANDING: Texto más oscuro para peso visual */}
      <div className="mb-16 px-2">
        <h2 className="text-3xl font-serif italic text-[#301919] leading-none">Luminous</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4A3737]/60 mt-2">Santuario Dental</p>
      </div>

      {/* NAVEGACIÓN PRINCIPAL */}
      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `
              flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all duration-500 group
              ${isActive 
                ? 'bg-white text-[#4A3737] shadow-xl shadow-brand-primary/10' 
                : 'text-[#4A3737]/50 hover:bg-white/40 hover:text-[#4A3737]'}
            `}
          >
            <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER SIDEBAR */}
      <div className="pt-8 space-y-6 border-t border-[#4A3737]/10">
        
        {/* BOTÓN EMERGENCIA: Más intenso para resaltar */}
        <a 
          href="tel:5512345678" 
          className="flex w-full items-center justify-center gap-x-4 rounded-[2.5rem] bg-brand-primary p-5 shadow-lg text-white hover:scale-105 transition-all duration-500 group"
        >
          <PhoneIcon className="w-6 h-6 group-hover:animate-pulse" />
          <div className="flex flex-col items-start leading-tight">
            <span className="font-sans font-bold text-[9px] uppercase tracking-[0.2em] opacity-80">
              Llamada de
            </span>
            <span className="font-sans font-bold text-[11px] uppercase tracking-[0.2em]">
              Emergencia
            </span>
          </div>
        </a>

        {/* AJUSTES Y LOGOUT */}
        <div className="space-y-2 px-2">
          <NavLink 
            to="/dashboard/ajustes"
            className={({ isActive }) => `
              flex items-center gap-4 py-2 transition-colors group
              ${isActive ? 'text-[#4A3737]' : 'text-[#4A3737]/40 hover:text-[#4A3737]'}
            `}
          >
            <Cog6ToothIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ajustes</span>
          </NavLink>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 py-2 text-[#4A3737]/40 hover:text-red-500 transition-colors group w-full text-left"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
};