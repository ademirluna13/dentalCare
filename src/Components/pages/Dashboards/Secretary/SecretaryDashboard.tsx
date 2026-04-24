import React, { useState } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { useSecretaryData } from '../../../../hooks/useSecretaryData';
import { 
  UsersIcon, CalendarIcon, BanknotesIcon, UserPlusIcon, 
  MagnifyingGlassIcon, CheckCircleIcon, ClockIcon, PhoneIcon, PlusIcon 
} from '@heroicons/react/24/outline';
// Importamos el modal que creamos en la estructura de Components
import { NewPatientModal } from '../../../../Components/Dashboards/Secretary/NewPatientModal';

export const SecretaryDashboard = () => {
  // 1. ESTADOS: Fecha seleccionada y control del Modal
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // 2. DATA: Obtenemos todo de la base de datos vía el Hook
  const { appointments, stats, loading, refresh } = useSecretaryData(selectedDate);
  
  const todayFormatted = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-neutral">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-serif italic text-brand-dark/60">Sincronizando Santuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-neutral bg-grain">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in text-brand-dark">
          
          {/* --- HEADER --- */}
          <header className="flex justify-between items-start">
            <div>
              <p className="text-brand-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-2">
                {todayFormatted}
              </p>
              <h1 className="text-5xl font-serif italic leading-none">Gestión Operativa</h1>
            </div>

            <div className="flex gap-4">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/30 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar paciente..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-14 pr-8 py-4 bg-white/60 backdrop-blur-md border border-brand-primary/10 rounded-[2rem] outline-none w-80 text-sm focus:ring-2 ring-brand-primary/20 transition-all shadow-inner text-brand-dark"
                />
              </div>
              <button 
                onClick={refresh} 
                className="p-4 bg-brand-dark text-white rounded-2xl hover:bg-brand-primary transition-all shadow-lg group"
              >
                <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </header>

          {/* --- STATS DINÁMICOS --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatBox title="Citas del Día" value={stats.todayCount} icon={CalendarIcon} color="bg-brand-primary" />
            <StatBox title="En Espera" value={stats.waitingCount} icon={ClockIcon} color="bg-brand-dark" />
            <StatBox title="Atendidos" value={stats.attendedCount} icon={CheckCircleIcon} color="bg-[#A8D1C3]" />
            <StatBox title="Ingresos" value={`$${stats.revenue}`} icon={BanknotesIcon} color="bg-brand-primary/80" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- AGENDA (9 COLUMNAS) --- */}
            <section className="lg:col-span-9 bg-white/80 backdrop-blur-md rounded-[3.5rem] border border-brand-primary/10 shadow-2xl overflow-hidden flex flex-col">
              
              {/* FILTRO DE FECHA */}
              <div className="p-8 pb-4 border-b border-brand-primary/5 flex justify-between items-center">
                <div className="space-y-1">
                   <h3 className="text-2xl font-serif italic text-brand-dark">Próximas Visitas</h3>
                   <p className="text-[9px] uppercase font-bold tracking-widest text-brand-dark/30">Filtro de agenda</p>
                </div>
                <div className="flex items-center gap-3 bg-brand-neutral/80 px-5 py-3 rounded-full border border-brand-primary/20 shadow-sm">
                  <CalendarIcon className="w-4 h-4 text-brand-primary" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent outline-none text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark cursor-pointer"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-brand-secondary/30">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">
                      <th className="px-8 py-5">Hora</th>
                      <th className="px-8 py-5">Paciente</th>
                      <th className="px-8 py-5">Tratamiento</th>
                      <th className="px-8 py-5">Estado</th>
                      <th className="px-8 py-5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-primary/5">
                    {appointments.length > 0 ? (
                      appointments.map((app) => (
                        <tr key={app.id} className="hover:bg-white/40 transition-colors group">
                          <td className="px-8 py-6 font-bold text-xs text-brand-primary">
                            {new Date(app.appointment_date).getUTCHours().toString().padStart(2, '0')}:00
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-serif italic text-base leading-tight">
                              {/* CORRECCIÓN: profiles es el objeto que viene del JOIN */}
                              {app.profiles?.full_name || 'Paciente Sin Nombre'}
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30">ID: #{app.id.slice(0, 4)}</p>
                          </td>
                          <td className="px-8 py-6 text-[10px] font-medium text-brand-dark/60 italic">{app.title}</td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                              app.status === 'attended' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-white border-brand-dark/10 text-brand-dark/40'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 hover:bg-brand-secondary rounded-xl text-brand-primary"><PhoneIcon className="w-4 h-4" /></button>
                              <button className="p-2 hover:bg-brand-secondary rounded-xl text-brand-dark"><UsersIcon className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-24 text-center font-serif italic text-brand-dark/20 text-2xl">
                          No hay citas para este día.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* --- ACCIONES Y TAREAS (3 COLUMNAS) --- */}
            <aside className="lg:col-span-3 space-y-6">
              {/* BOTÓN REGISTRO: Abre el Modal */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full group p-8 bg-brand-dark text-white rounded-[3rem] shadow-xl hover:bg-brand-primary transition-all duration-500 flex flex-col items-center gap-4"
              >
                <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <UserPlusIcon className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <span className="block text-xl font-serif italic">Nuevo Registro</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Dar de alta paciente</span>
                </div>
              </button>

              {/* LISTA DE LLAMADAS (CRM Rápido) */}
              <div className="bg-white/60 backdrop-blur-md p-8 rounded-[3.5rem] border border-brand-primary/10 shadow-xl">
                <h4 className="text-lg font-serif italic mb-6">Llamadas de Hoy</h4>
                <div className="space-y-4">
                   <ReminderItem name="Brenda Itzel" task="Confirmar cita mañana" phone="55-1234-5678" />
                   <ReminderItem name="Juan Pérez" task="Pago de mensualidad" phone="55-8765-4321" />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* --- EL MODAL (Fuera del flujo pero controlado por el Dashboard) --- */}
        <NewPatientModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={refresh}
        />
      </main>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const StatBox = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] border border-brand-primary/10 shadow-lg flex items-center gap-5 group hover:scale-[1.02] transition-all">
    <div className={`p-4 ${color} text-white rounded-2xl shadow-lg shadow-black/5 transition-transform group-hover:rotate-6`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30">{title}</p>
      <p className="text-xl font-serif italic leading-none mt-1">{value}</p>
    </div>
  </div>
);

const ReminderItem = ({ name, task, phone }: any) => (
  <div className="p-4 rounded-2xl bg-brand-neutral/50 border border-brand-primary/5 hover:bg-white transition-all group border-l-4 border-l-brand-primary">
    <p className="text-[10px] font-bold text-brand-dark">{name}</p>
    <p className="text-[9px] text-brand-dark/40 mb-2 leading-tight">{task}</p>
    <a href={`tel:${phone}`} className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-dark transition-colors">
      <PhoneIcon className="w-3 h-3" /> {phone}
    </a>
  </div>
);