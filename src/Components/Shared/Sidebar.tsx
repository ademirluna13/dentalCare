import React from 'react';
import { supabase } from '../../lib/supabase'; 
import { 
  UserIcon, CalendarIcon, HeartIcon, 
  DocumentIcon, CreditCardIcon, Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon, PhoneIcon 
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Mi Perfil', icon: UserIcon, active: true },
  { name: 'Mis Citas', icon: CalendarIcon },
  { name: 'Mi Tratamiento', icon: HeartIcon },
  { name: 'Mis Estudios', icon: DocumentIcon },
  { name: 'Mis Pagos', icon: CreditCardIcon },
];

export const Sidebar = () => {
  // --- LOS HOOKS Y FUNCIONES VAN AQUÍ ADENTRO ---
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login'); // Te manda de patitas a la calle (al login)
    } catch (error) {
      console.error("Error al salir del santuario:", error);
    }
  };

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 bg-white/60 backdrop-blur-xl border-r border-brand-primary/10 p-8 flex flex-col z-50">
      <div className="mb-12">
        <h2 className="text-2xl font-serif italic text-brand-dark leading-none">Luminous Clinic</h2>
        <p className="text-[9px] font-sans font-bold uppercase tracking-[0.3em] text-brand-primary mt-1">Patient Portal</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.name}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[10px] font-sans font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer
              ${item.active 
                ? 'bg-brand-primary/10 text-brand-primary shadow-sm shadow-brand-primary/10' 
                : 'text-brand-dark/50 hover:bg-brand-primary/5 hover:text-brand-dark'}`}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </a>
        ))}
      </nav>

      <div className="space-y-6 pt-8 border-t border-brand-primary/10">
        <button className="w-full py-4 bg-gradient-to-r from-[#D98B8B] to-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all">
          <PhoneIcon className="w-4 h-4" />
          Llamada de emergencia
        </button>
        
        <div className="space-y-2">
          <a className="flex items-center gap-4 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark transition-colors cursor-pointer group">
            <Cog6ToothIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> Ajustes
          </a>
          
          {/* El botón de Logout con la lógica de Malbitec */}
          <a 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 hover:text-brand-primary transition-colors cursor-pointer group"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            Cerrar Sesión
          </a>
        </div>
      </div>
    </aside>
  );
};