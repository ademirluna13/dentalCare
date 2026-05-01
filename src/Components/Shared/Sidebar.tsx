import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  HomeIcon, UsersIcon, UserIcon, HeartIcon, 
  DocumentTextIcon, CalendarIcon, CreditCardIcon, 
  Cog6ToothIcon, ArrowLeftOnRectangleIcon, PhoneIcon,
  Bars3Icon, AcademicCapIcon, IdentificationIcon,
  ShieldCheckIcon, CurrencyDollarIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState<string | null>(localStorage.getItem('user-role'));
  const [loading, setLoading] = useState(!role);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUserRole = async () => {
      if (role) {
        setLoading(false);
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          if (data) {
            setRole(data.role);
            localStorage.setItem('user-role', data.role);
          }
        }
      } catch (err) {
        console.error("Error detectando rol:", err);
      } finally {
        setLoading(false);
      }
    };
    getUserRole();
  }, [role]);

  const handleLogout = async () => {
    const result = await MySwal.fire({
      title: <span className="font-serif italic text-[#4A3737]">¿Cerrar sesión?</span>,
      html: <p className="text-sm text-[#4A3737]/60 font-sans">El santuario guardará tu progreso.</p>,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Quedarme',
      confirmButtonColor: '#4A3737', 
      background: '#F8F7F4', 
      customClass: {
        popup: 'rounded-[3.5rem] border border-[#F4B6B6]/20 shadow-2xl',
        confirmButton: 'rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-widest',
        cancelButton: 'rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#4A3737]'
      }
    });

    if (result.isConfirmed) {
      await supabase.auth.signOut();
      localStorage.removeItem('user-role');
      navigate('/login', { replace: true });
    }
  };

  const menuConfig = {
    admin: [
      { name: 'Dashboard Central', icon: HomeIcon, path: '/admin/dashboard' },
      { name: 'Pacientes Global', icon: UsersIcon, path: '/admin/pacientes' },
      { name: 'Equipo', icon: AcademicCapIcon, path: '/admin/dentistas' },
      { name: 'Staff', icon: IdentificationIcon, path: '/admin/staff' },
      { name: 'Finanzas', icon: CurrencyDollarIcon, path: '/admin/finanzas' },
      { name: 'Auditoría Logs', icon: ShieldCheckIcon, path: '/admin/auditoria' },
    ],
    secretary: [
      { name: 'Gestión Operativa', icon: HomeIcon, path: '/secretaria/dashboard' },
      { name: 'Agenda General', icon: CalendarIcon, path: '/secretaria/agenda' }, 
      { name: 'Pacientes', icon: UsersIcon, path: '/secretaria/pacientes' },
      { name: 'Caja y Cobros', icon: CreditCardIcon, path: '/secretaria/cash' },
    ],
    doctor: [
      { name: 'Panel Clínico', icon: HomeIcon, path: '/dentista/dashboard' },
      { name: 'Mis Pacientes', icon: UsersIcon, path: '/dentista/pacientes' },
      { name: 'Odontogramas', icon: HeartIcon, path: '/dentista/odontogramas' },
    ],
    patient: [
      { name: 'Mi Perfil', icon: UserIcon, path: '/dashboard' },
      { name: 'Mis Citas', icon: CalendarIcon, path: '/dashboard/citas' },
      { name: 'Tratamiento', icon: HeartIcon, path: '/dashboard/tratamiento' },
      { name: 'Estudios', icon: DocumentTextIcon, path: '/dashboard/estudios' },
    ]
  };

  const currentMenu = role === 'admin' ? menuConfig.admin
                    : role === 'secretary' ? menuConfig.secretary 
                    : role === 'doctor' ? menuConfig.doctor 
                    : menuConfig.patient;

  const isPatient = role === 'patient' || !role;

  if (loading) {
    return <aside className="hidden lg:block fixed left-0 top-0 h-screen w-72 bg-[#FCECEC] animate-pulse z-50 border-r border-[#F4B6B6]/10" />;
  }

  return (
    <>
      <div 
        className={`lg:hidden transition-all duration-500 px-6 py-4 flex justify-between items-center ${isScrolled ? 'bg-[#FCECEC]/80 backdrop-blur-xl border-b border-[#F4B6B6]/10 shadow-lg' : 'bg-transparent'}`}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}
      >
        <h2 className="text-2xl font-serif italic text-[#4A3737]">Luminous</h2>
        <button onClick={() => setIsOpen(true)} className="p-3 rounded-2xl text-[#4A3737] bg-white/40 border border-white/50 shadow-sm">
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-[#4A3737]/20 backdrop-blur-sm z-[10000]" />
      )}

      <aside 
        className={`fixed left-0 top-0 h-screen w-72 bg-[#FCECEC] border-r border-[#F4B6B6]/10 p-10 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ zIndex: 10001 }}
      >
        
        {/* BRANDING: FOTO Y NOMBRE ARRIBA */}
        <div className="mb-4 flex flex-col items-center group cursor-default pt-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4A3737] to-[#F4B6B6] p-[2px] shadow-2xl transition-transform duration-700 group-hover:rotate-[360deg]">
              <div className="w-full h-full rounded-full bg-[#FCECEC] flex items-center justify-center overflow-hidden border-4 border-[#FCECEC]">
                <SparklesIcon className="w-10 h-10 text-[#F4B6B6] opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#629483] rounded-full border-4 border-[#FCECEC] flex items-center justify-center shadow-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-3xl font-serif italic text-[#4A3737] leading-none tracking-tighter">Luminous</h2>
          </div>
        </div>

        {/* NAVEGACIÓN DINÁMICA: CON "RESPIRACIÓN" DESDE ESTUDIOS */}
        <nav className="flex-1 mt-6 space-y-1 overflow-hidden pr-2">
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/' && item.path !== '/dashboard');
            
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`flex items-center gap-5 px-6 py-4 rounded-[2rem] transition-all duration-500 group relative
                  ${isActive ? 'bg-white shadow-xl shadow-[#4A3737]/5 text-[#4A3737]' : 'text-[#4A3737]/40 hover:bg-white/30 hover:text-[#4A3737]'}`}
              >
                {isActive && <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-[#F4B6B6] animate-pulse" />}
                <item.icon className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-[#F4B6B6] scale-110' : 'group-hover:text-[#F4B6B6]'}`} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* BLOQUE INFERIOR COMPACTO: SIN ESPACIOS MUERTOS */}
        <div className="mt-auto">
          {isPatient && (
            <div className="pb-2">
              <button className="w-full bg-[#4A3737] hover:bg-[#2C2C2C] text-white p-5 rounded-[2.5rem] shadow-xl shadow-[#4A3737]/20 transition-all flex flex-col items-center gap-1 group active:scale-95">
                <PhoneIcon className="w-4 h-4 text-[#F4B6B6] group-hover:animate-bounce" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Emergencia</p>
              </button>
            </div>
          )}

          <div className="space-y-4 px-2 pt-2 relative pb-4">
            <Link to="/dashboard/ajustes" className="flex items-center gap-5 text-[#4A3737]/30 hover:text-[#F4B6B6] transition-all group w-full">
              <Cog6ToothIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Configuración</span>
            </Link>

            <button onClick={handleLogout} className="flex items-center gap-5 text-[#4A3737]/30 hover:text-rose-400 transition-all group w-full outline-none">
              <ArrowLeftOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Salir del Portal</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};