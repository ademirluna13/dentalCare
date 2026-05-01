import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { supabase } from '../../../../lib/supabase';
import Swal from 'sweetalert2';
import { 
  BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, 
  PlusIcon, XMarkIcon, LockClosedIcon, LockOpenIcon,
  PencilSquareIcon, TrashIcon, CalendarDaysIcon,
  ClockIcon, SparklesIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';

export const CashControl = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  // Catálogo dinámico desde la base
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, balance: 0 });
  const [isLocked, setIsLocked] = useState(false);
  
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [historyDetails, setHistoryDetails] = useState<any[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado del formulario
  const [form, setForm] = useState({ amount: '', description: '', category: '', method: 'efectivo', type: 'egreso' });
  const [manualCategory, setManualCategory] = useState('');

  const todayStr = new Date().toLocaleDateString('en-CA');

  const fetchData = async () => {
    setLoading(true);
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    
    try {
      const { data: trans } = await supabase.from('clinic_transactions').select('*')
        .gte('created_at', startOfDay.toISOString()).order('created_at', { ascending: false });

      const { data: closure } = await supabase.from('daily_closures').select('status').eq('closure_date', todayStr).maybeSingle();

      const { data: historyData } = await supabase.from('daily_closures')
        .select('*').order('closure_date', { ascending: false }).limit(30);

      // Jalar categorías del catálogo
      const { data: cats } = await supabase.from('transaction_categories').select('*').order('name', { ascending: true });

      if (cats) setDbCategories(cats);

      if (trans) {
        setTransactions(trans);
        const inc = trans.filter(t => t.type === 'ingreso').reduce((s, t) => s + Number(t.amount), 0);
        const out = trans.filter(t => t.type === 'egreso').reduce((s, t) => s + Number(t.amount), 0);
        setSummary({ totalIn: inc, totalOut: out, balance: inc - out });
      }
      if (historyData) setHistory(historyData);
      setIsLocked(closure?.status === 'closed');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openHistoryDetail = async (dateStr: string) => {
    setSelectedHistoryDate(dateStr);
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    
    const [year, month, day] = dateStr.split('-');
    const startLocal = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0);
    const endLocal = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);

    try {
      const { data, error } = await supabase
        .from('clinic_transactions')
        .select('*')
        .gte('created_at', startLocal.toISOString())
        .lte('created_at', endLocal.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      setHistoryDetails(data || []);
    } catch (err: any) {
      Swal.fire('Error', 'No pudimos jalar los movimientos.', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Si eligió "Otro", guardamos lo que escribió a mano
      const finalCategory = form.category === 'Otro (Manual)' ? manualCategory : form.category;
      
      const payload = { amount: parseFloat(form.amount), description: form.description, category: finalCategory, method: form.method, type: form.type };
      
      if (isEditMode) {
        await supabase.from('clinic_transactions').update(payload).eq('id', selectedId);
      } else {
        await supabase.from('clinic_transactions').insert([payload]);
      }
      setIsModalOpen(false); resetForm(); fetchData();
      Swal.fire({ position: 'top-end', icon: 'success', title: 'Ingreso registrado', showConfirmButton: false, timer: 1500, toast: true });
    } catch (e: any) { Swal.fire('Error', e.message, 'error'); }
    finally { setIsSubmitting(false); }
  };

  const resetForm = () => { 
    const defaultEgreso = dbCategories.find(c => c.type === 'egreso')?.name || '';
    setForm({ amount: '', description: '', category: defaultEgreso, method: 'efectivo', type: 'egreso' }); 
    setManualCategory('');
    setIsEditMode(false); 
    setSelectedId(null); 
  };

  const handleToggleClosure = async () => {
    const action = isLocked ? 'reabrir' : 'cerrar';
    const result = await Swal.fire({ title: `¿Quieres ${action} la caja?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#4A3737', confirmButtonText: `Sí, ${action}`, background: '#F8F7F4' });
    if (result.isConfirmed) {
      await supabase.from('daily_closures').upsert({ closure_date: todayStr, total_in: summary.totalIn, total_out: summary.totalOut, balance: summary.balance, status: isLocked ? 'open' : 'closed' }, { onConflict: 'closure_date' });
      fetchData();
    }
  };

  const handleTypeChange = (newType: 'ingreso' | 'egreso') => {
      const defaultCat = dbCategories.find(c => c.type === newType)?.name || '';
      setForm({ ...form, type: newType, category: defaultCat });
  };

  const currentOptions = dbCategories.filter(c => c.type === form.type);

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] overflow-x-hidden w-full max-w-[100vw]">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-32 lg:pt-16 bg-[#F8F7F4] min-h-screen w-full lg:rounded-l-[4rem] relative z-10 text-[#4A3737]">
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3"><div className="h-[1px] w-8 bg-[#F4B6B6]" /><p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[10px]">Finance Sanctuary</p></div>
              <h1 className="text-5xl md:text-7xl font-serif italic tracking-tighter leading-none">Caja y <span className="text-[#F4B6B6]">Cobros</span></h1>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
                <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-gray-100 shadow-sm flex flex-1 md:flex-none">
                    <button onClick={() => setActiveTab('today')} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'today' ? 'bg-[#4A3737] text-white shadow-lg' : 'text-gray-300'}`}>Hoy</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-[#4A3737] text-white shadow-lg' : 'text-gray-300'}`}>Historial</button>
                </div>
                <button onClick={handleToggleClosure} className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${isLocked ? 'bg-[#629483] text-white' : 'bg-[#4A3737] text-[#F4B6B6]'}`}>
                {isLocked ? <><LockOpenIcon className="w-4 h-4 inline mr-2 stroke-[3]"/> Reabrir</> : <><LockClosedIcon className="w-4 h-4 inline mr-2 stroke-[3]"/> Cerrar Día</>}
                </button>
            </div>
          </header>

          {activeTab === 'today' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                <StatCard title="Ingresos" value={summary.totalIn} icon={ArrowTrendingUpIcon} color="text-[#629483]" bg="bg-green-50" />
                <StatCard title="Egresos" value={summary.totalOut} icon={ArrowTrendingDownIcon} color="text-rose-500" bg="bg-rose-50" />
                <div className={`p-10 rounded-[3.5rem] shadow-2xl flex items-center gap-8 text-white ${isLocked ? 'bg-[#629483]' : 'bg-[#4A3737]'}`}>
                  <div className="p-5 bg-white/10 rounded-3xl"><BanknotesIcon className="w-10 h-10 text-[#F4B6B6]"/></div>
                  <div><p className="text-[10px] font-black uppercase text-white/40 mb-1">Balance Final</p><p className="text-4xl font-serif italic">${summary.balance.toLocaleString()}</p></div>
                </div>
              </div>

              <section className="bg-white rounded-[4rem] shadow-xl border border-gray-50 overflow-hidden relative mx-2 min-h-[500px]">
                {isLocked && <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-20 flex items-center justify-center animate-fade-in"><div className="bg-[#4A3737] text-white px-12 py-6 rounded-[2.5rem] font-serif italic text-2xl border border-[#F4B6B6]/30 shadow-2xl flex items-center gap-4"><LockClosedIcon className="w-8 h-8 text-[#F4B6B6]" /> Caja cerrada</div></div>}
                
                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-[#FCECEC]/10">
                  <h3 className="text-2xl font-serif italic">Movimientos Recientes</h3>
                  {!isLocked && (
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="group px-8 py-4 bg-[#4A3737] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all flex items-center gap-2">
                      <PlusIcon className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform" /> Nuevo Movimiento
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-[#F8F7F4]/50"><tr><th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Hora</th><th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Concepto</th><th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 text-right">Monto</th><th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 text-center">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-[#FCECEC]/10 transition-colors group">
                            <td className="px-12 py-10 text-gray-300 font-black tracking-widest text-[11px]">
                                <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4"/> {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="px-12 py-10">
                                <p className={`font-serif italic text-3xl mb-1 ${t.type === 'egreso' ? 'text-rose-500' : 'text-[#4A3737]'}`}>{t.description}</p>
                                <span className="px-3 py-1 bg-[#F8F7F4] rounded-lg text-[8px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">{t.category}</span>
                            </td>
                            <td className={`px-12 py-10 text-right font-serif italic text-4xl ${t.type === 'egreso' ? 'text-rose-400' : 'text-[#629483]'}`}>
                                {t.type === 'egreso' ? '-' : '+'} ${Number(t.amount).toLocaleString()}
                            </td>
                            <td className="px-12 py-10 text-center">
                              {!isLocked && (
                                <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                    <button onClick={async () => { const res = await Swal.fire({ title: '¿Borrar?', icon: 'warning', showCancelButton: true }); if(res.isConfirmed) { await supabase.from('clinic_transactions').delete().eq('id', t.id); fetchData(); } }} className="p-4 bg-rose-50 rounded-2xl text-rose-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                              )}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </section>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-2 animate-fade-in">
                {history.map((h) => (
                    <div key={h.closure_date} onClick={() => openHistoryDetail(h.closure_date)} className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden active:scale-95 group">
                         <div className="absolute top-0 right-0 p-8 opacity-5"><CalendarDaysIcon className="w-24 h-24 text-[#4A3737]" /></div>
                         <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#F4B6B6] mb-4">{new Date(h.closure_date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                         <h4 className="text-4xl font-serif italic text-[#4A3737] mb-8">${h.balance.toLocaleString()}</h4>
                         <div className="space-y-4 border-t border-gray-50 pt-8 text-left">
                            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Ingresos</span><span className="text-sm font-bold text-[#629483]">${h.total_in.toLocaleString()}</span></div>
                            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Egresos</span><span className="text-sm font-bold text-rose-400">${h.total_out.toLocaleString()}</span></div>
                         </div>
                    </div>
                ))}
            </div>
          )}
        </div>

        {/* MODAL DETALLE DE MOVIMIENTOS */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-[#4A3737]/80 backdrop-blur-xl animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden relative border border-white/20">
              <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-[#FCECEC]/20">
                <div className="text-left">
                  <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[10px] mb-2">Desglose de Movimientos</p>
                  <h3 className="text-4xl font-serif italic text-[#4A3737] capitalize">
                    {new Date(selectedHistoryDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="p-4 bg-white rounded-2xl text-gray-300 hover:text-rose-500 shadow-xl active:scale-90 transition-all"><XMarkIcon className="w-6 h-6 stroke-[3]" /></button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                {loadingDetail ? (
                   <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-[#F4B6B6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="font-serif italic text-gray-400">Jalando datos...</p></div>
                ) : historyDetails.length > 0 ? historyDetails.map((det) => (
                  <div key={det.id} className="flex items-center gap-6 p-6 bg-[#F8F7F4] rounded-[2.5rem] border border-gray-50 hover:bg-white hover:shadow-md transition-all">
                    <div className={`p-4 rounded-2xl ${det.type === 'egreso' ? 'bg-rose-50 text-rose-500' : 'bg-green-50 text-[#629483]'}`}>
                       {det.type === 'egreso' ? <ArrowTrendingDownIcon className="w-6 h-6" /> : <ArrowTrendingUpIcon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-serif italic text-2xl text-[#4A3737] leading-none mb-2">{det.description}</p>
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{det.category} • {new Date(det.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`text-3xl font-serif italic ${det.type === 'egreso' ? 'text-rose-400' : 'text-[#629483]'}`}>
                      {det.type === 'egreso' ? '-' : '+'}${Number(det.amount).toLocaleString()}
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-20 font-serif italic text-gray-300 text-2xl">Sin registro en esta fecha.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL REGISTRO DINÁMICO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#4A3737]/70 backdrop-blur-xl animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-12 relative overflow-hidden text-left">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 bg-[#F8F7F4] rounded-2xl text-gray-300 hover:text-rose-500 transition-all"><XMarkIcon className="w-6 h-6 stroke-[3]"/></button>
              
              <div className="mb-8">
                  <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px] mb-2">Registro Contable</p>
                  <h3 className="text-4xl font-serif italic text-[#4A3737]">{isEditMode ? 'Ajustar Movimiento' : 'Nuevo Movimiento'}</h3>
              </div>

              <form onSubmit={handleSave} className="space-y-6 relative z-10">
                <div className="flex bg-[#F8F7F4] p-1.5 rounded-full border border-gray-100">
                    <button type="button" onClick={() => handleTypeChange('ingreso')} className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${form.type === 'ingreso' ? 'bg-[#629483] text-white shadow-md' : 'text-gray-400 hover:text-[#4A3737]'}`}>Entrada (Ingreso)</button>
                    <button type="button" onClick={() => handleTypeChange('egreso')} className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${form.type === 'egreso' ? 'bg-rose-500 text-white shadow-md' : 'text-gray-400 hover:text-[#4A3737]'}`}>Salida (Gasto)</button>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Monto Total</label>
                    <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" className={`w-full p-8 bg-[#F8F7F4] rounded-[2.5rem] outline-none text-5xl font-serif italic shadow-inner transition-colors ${form.type === 'ingreso' ? 'text-[#629483] focus:border-[#629483]' : 'text-rose-500 focus:border-rose-500'}`} />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Concepto / Descripción</label>
                    <input required type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder={form.type === 'ingreso' ? 'Ej. Pago de Ortodoncia...' : 'Ej. Compra de resinas...'} className="w-full p-6 bg-[#F8F7F4] rounded-2xl outline-none text-sm focus:border-[#4A3737]" />
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Categoría</label>
                        <div className="relative">
                            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-6 bg-[#F8F7F4] rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:border-[#F4B6B6] transition-all">
                                {currentOptions.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {form.category === 'Otro (Manual)' && (
                        <div className="space-y-2 animate-slide-down">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[#F4B6B6] ml-4">Especifica la categoría</label>
                            <input required type="text" value={manualCategory} onChange={e => setManualCategory(e.target.value)} placeholder="Escribe aquí..." className="w-full p-6 bg-white border-2 border-[#F4B6B6]/40 rounded-2xl outline-none text-sm font-medium focus:border-[#F4B6B6] transition-all" />
                        </div>
                    )}
                </div>

                <button disabled={isSubmitting} type="submit" className={`w-full py-8 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-95 disabled:opacity-50 mt-4 ${form.type === 'ingreso' ? 'bg-[#629483] hover:bg-green-700' : 'bg-[#4A3737] hover:bg-rose-600'}`}>
                  {isSubmitting ? 'PROCESANDO...' : 'CONFIRMAR TRANSACCIÓN'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 flex items-center gap-8 hover:shadow-xl transition-all group">
    <div className={`p-5 ${bg} ${color} rounded-3xl transition-transform group-hover:scale-110 shadow-sm`}><Icon className="w-10 h-10 stroke-[2]"/></div>
    <div className="text-left"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-1">{title}</p><p className={`text-4xl font-serif italic ${color}`}>${value.toLocaleString()}</p></div>
  </div>
);