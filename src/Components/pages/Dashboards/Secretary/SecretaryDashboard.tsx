import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { useSecretaryData } from '../../../../hooks/useSecretaryData';
import { NewPatientModal } from '../../../../Components/Dashboards/Secretary/NewPatientModal';
import { 
  CalendarIcon, BanknotesIcon, UserPlusIcon, 
  CheckCircleIcon as CheckOutline, ClockIcon, PhoneIcon,
  ChatBubbleLeftRightIcon, UserIcon, SparklesIcon, XMarkIcon,
  ArrowUturnLeftIcon, NoSymbolIcon, PlusIcon, TrashIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import Swal from 'sweetalert2';

export const SecretaryDashboard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  
  const [currentTab, setCurrentTab] = useState<'pending' | 'attended'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  
  // Balance General del día
  const [netBalance, setNetBalance] = useState(0);

  const [reminders, setReminders] = useState<any[]>([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);

  const { appointments = [], loading, refresh } = useSecretaryData(selectedDate);

  // --- LÓGICA DE RECORDATORIOS ---
  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReminders(data || []);
    } catch (err) {
      console.error("Error en sincronización de recordatorios");
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const openNewReminder = () => {
    setEditingReminder(null);
    setIsReminderModalOpen(true);
  };

  const openEditReminder = (rem: any) => {
    setEditingReminder(rem);
    setIsReminderModalOpen(true);
  };

  const handleWhatsAppAlert = (link: string) => {
    if (!link || link.includes('undefined') || link.endsWith('52')) {
      Swal.fire({ title: 'Atención', text: 'El paciente no tiene un número válido registrado.', icon: 'warning', confirmButtonColor: '#4A3737', background: '#F8F7F4' });
      return;
    }
    window.open(link, '_blank');
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const { value: reason } = await Swal.fire({
      title: 'Cancelar Cita', input: 'text', inputLabel: 'Motivo de la cancelación', showCancelButton: true, confirmButtonText: 'Confirmar', cancelButtonText: 'Regresar', confirmButtonColor: '#F4B6B6', cancelButtonColor: '#4A3737', background: '#F8F7F4', customClass: { popup: 'rounded-[3rem]' }, inputValidator: (value) => { if (!value) return 'Por favor ingresa un motivo.'; }
    });
    if (reason) {
      setProcessingId(appointmentId);
      try {
        await supabase.from('appointments').update({ status: 'cancelled', cancellation_reason: reason }).eq('id', appointmentId);
        setLocalStatuses(prev => ({ ...prev, [appointmentId]: 'cancelled' }));
        if (refresh) refresh();
      } catch (e: any) {
        Swal.fire('Error', `No se pudo procesar: ${e.message}`, 'error');
      } finally { setProcessingId(null); }
    }
  };

  // --- BALANCE GENERAL CON FIX DE HORA LOCAL ---
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const [year, month, day] = selectedDate.split('-');
        const start = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0);
        const end = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);

        const { data, error } = await supabase
          .from('clinic_transactions')
          .select('amount, type')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());
          
        if (error) throw error;

        if (data) {
          const total = data.reduce((acc, item) => {
            return item.type === 'ingreso' ? acc + Number(item.amount) : acc - Number(item.amount);
          }, 0);
          setNetBalance(total);
        }
      } catch (e) { 
        console.error("Fallo en cálculo de balance");
      }
    };
    fetchBalance();
  }, [selectedDate, appointments]);

  // --- BÚSQUEDA GLOBAL ---
  useEffect(() => {
    if (!search) { setGlobalSearchResults([]); return; }
    const fetchGlobalSearch = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, profiles!inner(full_name, phone)')
        .ilike('profiles.full_name', `%${search}%`)
        .order('appointment_date', { ascending: true });
      if (!error && data) setGlobalSearchResults(data);
    };
    const timer = setTimeout(fetchGlobalSearch, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // --- ACCIONES DE CITA ---
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (processingId) return;
    const isClosed = currentStatus === 'attended' || currentStatus === 'cancelled';
    
    if (isClosed) {
      const confirm = await Swal.fire({ title: '¿Reactivar cita?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, reactivar', confirmButtonColor: '#4A3737', background: '#F8F7F4' });
      if (!confirm.isConfirmed) return;
    }

    const newStatus = isClosed ? 'scheduled' : 'attended';
    setProcessingId(id);
    try {
      await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
      setLocalStatuses(prev => ({ ...prev, [id]: newStatus }));
      if (refresh) refresh();
    } finally { setProcessingId(null); }
  };

  const displayAppointments = search 
    ? globalSearchResults 
    : (appointments || []).filter(app => {
        const status = localStatuses[app.id] || app.status;
        return currentTab === 'attended' ? (status === 'attended' || status === 'cancelled') : (status !== 'attended' && status !== 'cancelled');
      });

  const statusLabels: Record<string, string> = {
    scheduled: 'Programado', cancelled: 'Cancelada', waiting: 'En espera', attended: 'Atendido'
  };

  const todayFormatted = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading && !search && appointments.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F4B6B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-serif italic text-[#4A3737]/60">Sincronizando Sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] w-full">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12 pt-28 lg:pt-16 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12 animate-fade-in text-[#4A3737]">
          
          {/* HEADER RESPONSIVE */}
          <header className="flex flex-col xl:flex-row justify-between items-stretch xl:items-end gap-8 px-2">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-[#F4B6B6]" />
                <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px]">Luminous Ecosystem</p>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic tracking-tighter leading-none">
                Gestión <span className="text-[#F4B6B6]">Operativa</span>
              </h1>
              <p className="text-[#4A3737]/40 uppercase tracking-[0.3em] text-[9px] font-black">{todayFormatted}</p>
            </div>
            
            {/* RECORDATORIOS COMPACTOS */}
            <div className="w-full xl:w-[50%] bg-[#4A3737] p-5 md:p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h4 className="text-lg font-serif italic text-white">Pendientes</h4>
                  <button onClick={openNewReminder} className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#4A3737] bg-[#F4B6B6] px-3 py-1.5 rounded-full hover:bg-white transition-all active:scale-95">
                    <PlusIcon className="w-3 h-3 stroke-[3]" /> Nuevo
                  </button>
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x relative z-10">
                   {reminders.map(rem => (
                     <div key={rem.id} onClick={() => openEditReminder(rem)} className="min-w-[180px] md:min-w-[220px] snap-start">
                       <ReminderItem name={rem.patient_name} task={rem.task} phone={rem.phone} />
                     </div>
                   ))}
                   {reminders.length === 0 && <p className="text-white/20 italic text-xs py-2 px-2">Sin pendientes activos.</p>}
                </div>
            </div>
          </header>

          {/* STATS GRID COMPACTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2">
            <StatBox title="Citas Hoy" value={appointments.length} icon={CalendarIcon} color="bg-[#F4B6B6]" />
            <StatBox title="Pendientes" value={appointments.filter(a => (localStatuses[a.id] || a.status) === 'scheduled').length} icon={ClockIcon} color="bg-[#4A3737]" />
            <StatBox title="Cerradas" value={appointments.filter(a => (localStatuses[a.id] || a.status) === 'attended').length} icon={CheckSolid} color="bg-[#A8D1C3]" />
            <StatBox title="Balance Caja" value={`$${netBalance.toLocaleString('es-MX')}`} icon={BanknotesIcon} color={netBalance >= 0 ? "bg-[#629483]" : "bg-rose-500"} />
          </div>

          {/* SECCIÓN PRINCIPAL: TABLA Y BUSCADOR */}
          <section className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-xl border border-gray-50 overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-[#FCECEC]/10">
              <div className="flex bg-[#F8F7F4] p-1.5 rounded-full border border-gray-100 w-full lg:w-auto">
                <button onClick={() => setCurrentTab('pending')} className={`flex-1 lg:flex-none px-6 md:px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'pending' ? 'bg-[#4A3737] text-white shadow-lg' : 'text-gray-300'}`}>Pendientes</button>
                <button onClick={() => setCurrentTab('attended')} className={`flex-1 lg:flex-none px-6 md:px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentTab === 'attended' ? 'bg-[#4A3737] text-white shadow-lg' : 'text-gray-300'}`}>Historial</button>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full lg:max-w-xl">
                <div className="relative flex-1 group">
                   <input type="text" placeholder="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-6 py-3.5 bg-[#F8F7F4] border border-gray-100 rounded-full outline-none text-sm focus:border-[#F4B6B6] transition-all" />
                   <SparklesIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
                <div className="flex items-center gap-3 bg-[#F8F7F4] px-5 py-3.5 rounded-full border border-gray-100">
                  <CalendarIcon className="w-4 h-4 text-[#F4B6B6]" />
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest text-[#4A3737] cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full flex-1">
              <table className="w-full text-left table-fixed min-w-[900px]">
                <thead>
                  <tr className="bg-[#4A3737] text-white">
                    <th className="w-[12%] px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Hora</th>
                    <th className="w-[30%] px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Paciente</th>
                    <th className="w-[28%] px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Servicio</th>
                    <th className="w-[15%] px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-center">Estado</th>
                    <th className="w-[15%] px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayAppointments.map((app) => {
                    const status = localStatuses[app.id] || app.status;
                    const isClosed = status === 'attended' || status === 'cancelled';
                    return (
                      <tr key={app.id} className="hover:bg-[#FCECEC]/10 transition-colors group">
                        <td className="px-8 py-8 font-serif italic text-2xl text-[#F4B6B6]">
                           {app.appointment_date ? new Date(app.appointment_date).getHours() + ':00' : '--'}
                        </td>
                        <td className="px-8 py-8">
                          <p className="font-serif text-xl text-[#4A3737] leading-none mb-1.5">{app.profiles?.full_name || 'Nuevo Paciente'}</p>
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">Expediente ID: {app.id.slice(0,8)}</span>
                        </td>
                        <td className="px-8 py-8 italic text-gray-400 text-sm leading-snug">{app.title}</td>
                        <td className="px-8 py-8 text-center">
                           <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-gray-50 ${status === 'attended' ? 'bg-[#A8D1C3]/10 text-[#629483]' : 'bg-gray-50 text-gray-400'}`}>{statusLabels[status] || status}</span>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={() => handleWhatsAppAlert(`https://wa.me/52${app.profiles?.phone?.replace(/\D/g, '')}`)} className="p-2.5 bg-green-50 text-green-500 rounded-xl hover:scale-110 transition-all"><ChatBubbleLeftRightIcon className="w-4 h-4" /></button>
                             <button onClick={() => navigate(`/secretary/patients/${app.patient_id}`)} className="p-2.5 bg-[#F8F7F4] text-[#4A3737] rounded-xl hover:scale-110 transition-all"><UserIcon className="w-4 h-4"/></button>
                             {!isClosed && (<button onClick={() => handleCancelAppointment(app.id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:scale-110 transition-all"><NoSymbolIcon className="w-4 h-4" /></button>)}
                             <button onClick={() => handleToggleStatus(app.id, status)} className={`p-2.5 rounded-xl transition-all ${isClosed ? 'bg-rose-50 text-rose-500' : 'bg-[#A8D1C3]/20 text-[#629483]'}`}>
                                {isClosed ? <ArrowUturnLeftIcon className="w-4 h-4"/> : <CheckOutline className="w-4 h-4"/>}
                             </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <button onClick={() => setIsModalOpen(true)} className="w-full p-6 md:p-10 bg-[#4A3737] text-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-6 group">
              <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-[#F4B6B6] transition-colors"><UserPlusIcon className="w-8 h-8 md:w-10 md:h-10 text-[#F4B6B6] group-hover:text-[#4A3737]" /></div>
              <span className="text-2xl md:text-4xl font-serif italic tracking-tighter">Registrar Nuevo Ingreso</span>
          </button>
        </div>

        <NewPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={refresh} />
        <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} onRefresh={fetchReminders} existingReminder={editingReminder} />
      </main>
    </div>
  );
};

// --- COMPONENTES AUXILIARES COMPACTOS Y ELEGANTES ---

const StatBox = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex items-center gap-4 hover:shadow-lg transition-all group">
    <div className={`p-4 ${color} text-white rounded-2xl shadow-md group-hover:scale-105 transition-transform`}><Icon className="w-5 h-5 stroke-[2.5]" /></div>
    <div className="text-left">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-300">{title}</p>
      <p className="text-xl font-serif italic text-[#4A3737] leading-none mt-0.5">{value}</p>
    </div>
  </div>
);

const ReminderItem = ({ name, task, phone }: any) => (
  <div className="p-5 rounded-[1.8rem] bg-white border border-white/10 hover:border-[#F4B6B6]/30 shadow-md transition-all cursor-pointer text-left h-full flex flex-col justify-between group relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-1 bg-[#F4B6B6] rounded-full" />
        <p className="text-[8px] text-gray-300 font-black uppercase tracking-[0.2em]">Pendiente</p>
      </div>
      <p className="text-base font-serif italic text-[#4A3737] mb-0.5 truncate">{name || 'Paciente'}</p>
      <p className="text-[11px] text-gray-400 font-medium line-clamp-1 mb-3">{task || 'Tarea...'}</p>
    </div>
    <div className="flex items-center gap-2 text-[9px] font-black text-[#F4B6B6] bg-[#FCECEC]/40 w-fit px-3 py-1.5 rounded-full relative z-10">
      <PhoneIcon className="w-3 h-3 stroke-[2.5]" /> 
      <span className="tracking-widest">{phone || '---'}</span>
    </div>
  </div>
);

// --- MODAL DE RECORDATORIOS Z-[100] ---
const ReminderModal = ({ isOpen, onClose, onRefresh, existingReminder }: any) => {
  const [name, setName] = useState('');
  const [task, setTask] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbPatients, setDbPatients] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, phone').order('full_name', { ascending: true });
      if (data) setDbPatients(data);
    };
    if (isOpen) fetch();
  }, [isOpen]);

  useEffect(() => {
    if (existingReminder) {
      setName(existingReminder.patient_name); setTask(existingReminder.task); setPhone(existingReminder.phone);
    } else {
      setName(''); setTask(''); setPhone('');
    }
  }, [existingReminder, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#4A3737]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="bg-white rounded-[3rem] md:rounded-[4rem] w-full max-w-xl shadow-2xl relative overflow-hidden border border-white/20">
        <div className="p-8 md:p-10 border-b border-gray-50 flex justify-between items-center bg-[#FCECEC]/20">
          <div className="text-left">
            <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px] mb-2">Panel Operativo</p>
            <h3 className="text-3xl md:text-4xl font-serif italic text-[#4A3737]">{existingReminder ? 'Actualizar' : 'Nuevo'} Pendiente</h3>
          </div>
          <button onClick={onClose} className="p-3 bg-white rounded-2xl text-gray-300 hover:text-rose-500 shadow-xl transition-all active:scale-90"><XMarkIcon className="w-5 h-5 stroke-[3]" /></button>
        </div>
        <div className="p-8 md:p-10 space-y-6 text-left">
          <div className="space-y-2 relative group">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-5">Paciente</label>
            <select value={name} onChange={e => { setName(e.target.value); const p = dbPatients.find(x => x.full_name === e.target.value); if(p?.phone) setPhone(p.phone); }} className="w-full px-6 py-5 rounded-[2rem] border border-gray-100 bg-[#F8F7F4] outline-none text-sm font-medium appearance-none transition-all focus:border-[#F4B6B6]">
              <option value="">Buscar en base de datos...</option>
              {dbPatients.map(p => (<option key={p.id} value={p.full_name}>{p.full_name}</option>))}
              <option value="Otro">Escribir manualmente...</option>
            </select>
            <ChevronDownIcon className="absolute right-6 bottom-5 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-[#F4B6B6]" />
          </div>
          {name === 'Otro' && (<input type="text" onChange={e => setName(e.target.value)} className="w-full px-6 py-5 rounded-[2rem] border border-gray-100 bg-white focus:border-[#F4B6B6] outline-none text-sm shadow-inner" placeholder="Nombre completo..." autoFocus />)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-5">Tarea</label>
              <input type="text" value={task} onChange={e => setTask(e.target.value)} className="w-full px-6 py-5 rounded-[2rem] border border-gray-100 bg-[#F8F7F4] focus:border-[#F4B6B6] outline-none text-sm transition-all" placeholder="Ej. Confirmar cita" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-5">Contacto</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-5 rounded-[2rem] border border-gray-100 bg-[#F8F7F4] focus:border-[#F4B6B6] outline-none text-sm transition-all" placeholder="10 dígitos" />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            {existingReminder && (
                <button onClick={async () => { const res = await supabase.from('reminders').delete().eq('id', existingReminder.id); if(!res.error){ onRefresh(); onClose(); } }} className="p-5 bg-rose-50 text-rose-400 rounded-3xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                    <TrashIcon className="w-5 h-5 stroke-[2.5]" />
                </button>
            )}
            <button onClick={async () => {
              if(!name || !task) return Swal.fire({title: 'Datos Incompletos', icon: 'warning', background: '#F8F7F4', confirmButtonColor: '#4A3737'});
              setLoading(true);
              const p = { patient_name: name, task, phone, status: 'active' };
              if(existingReminder) await supabase.from('reminders').update(p).eq('id', existingReminder.id);
              else await supabase.from('reminders').insert([p]);
              setLoading(false); onRefresh(); onClose();
            }} disabled={loading} className="flex-1 py-6 bg-[#4A3737] text-[#F4B6B6] rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] md:text-[11px] hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all shadow-xl flex items-center justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-[#F4B6B6] border-t-transparent rounded-full animate-spin" /> : 'CONFIRMAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};