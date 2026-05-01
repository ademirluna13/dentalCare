import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sidebar } from '../../../Shared/Sidebar';
import { supabase } from '../../../../lib/supabase';
import Swal from 'sweetalert2';
import { 
  ArrowLeftIcon, PhoneIcon, ChatBubbleLeftRightIcon,
  CameraIcon, ClipboardDocumentCheckIcon, ClockIcon, 
  CheckCircleIcon, DocumentIcon, XMarkIcon, 
  PlusIcon, BanknotesIcon, PencilSquareIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export const PatientProfile = () => {
  const { id } = useParams();
  
  // --- ESTADOS DE DATOS ---
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [studies, setStudies] = useState<any[]>([]);
  const [medicalNotes, setMedicalNotes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  // --- ESTADOS DE UI ---
  const [activeTab, setActiveTab] = useState<'historial' | 'estudios' | 'pagos'>('historial');
  const [loading, setLoading] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORMULARIOS ---
  const [newNote, setNewNote] = useState({ category: 'alergia', content: '' });
  const [newPayment, setNewPayment] = useState({ amount: '', description: '', status: 'Pagado' });

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // Traemos todo el chisme del paciente de un jalón
      const [profileRes, appsRes, stdsRes, notesRes, paysRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('appointments').select('*').eq('patient_id', id).order('appointment_date', { ascending: false }),
        supabase.from('studies').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
        supabase.from('medical_notes').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
        supabase.from('payments').select('*').eq('patient_id', id).order('created_at', { ascending: false })
      ]);

      setPatient(profileRes.data || null);
      setAppointments(appsRes.data || []);
      setStudies(stdsRes.data || []);
      setMedicalNotes(notesRes.data || []);
      setPayments(paysRes.data || []);
    } catch (error) {
      console.error("Error en BitXolo Fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchPatientData(); }, [id]);

  const handleAddNote = async () => {
    if (!newNote.content.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('medical_notes').insert([{ patient_id: id, category: newNote.category, content: newNote.content }]);
      if (error) throw error;
      setNewNote({ category: 'alergia', content: '' });
      setIsNoteModalOpen(false);
      fetchPatientData();
      Swal.fire({ icon: 'success', title: 'Nota agregada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (e) { Swal.fire('Error', 'No se guardó la nota', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || !newPayment.description) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('payments').insert([{ 
        patient_id: id, 
        amount: parseFloat(newPayment.amount), 
        description: newPayment.description, 
        status: newPayment.status 
      }]);
      if (error) throw error;
      setIsPaymentModalOpen(false);
      setNewPayment({ amount: '', description: '', status: 'Pagado' });
      fetchPatientData();
      Swal.fire({ icon: 'success', title: 'Cobro registrado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (e: any) { Swal.fire('Error', e.message, 'error'); }
    finally { setIsSubmitting(false); }
  };

  const totalPaid = payments?.filter(p => p.status === 'Pagado').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center ml-72 bg-[#F7F5F5]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#F4B6B6] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-serif italic text-[#4A3737]/40">Cargando expediente...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F7F5F5]">
      <Sidebar />
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in text-[#4A3737]">
          
          <Link to="/secretary/patients" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#F4B6B6] transition-all w-fit">
            <ArrowLeftIcon className="w-4 h-4" /> Volver al Directorio
          </Link>

          {/* CABECERA EXPEDIENTE */}
          <section className="bg-white rounded-[4rem] p-12 shadow-sm border border-gray-50 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
            <div className="w-48 h-48 rounded-[3.5rem] bg-[#4A3737] overflow-hidden border-8 border-white shadow-2xl flex items-center justify-center text-[#F4B6B6] text-7xl font-serif italic relative z-10">
              {patient?.avatar_url ? <img src={patient.avatar_url} className="w-full h-full object-cover" /> : patient?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left z-10">
              <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[10px] mb-3">Expediente Clínico</p>
              <h1 className="text-6xl font-serif italic tracking-tight leading-none mb-4">{patient?.full_name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="px-4 py-2 bg-[#F7F5F5] rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400">Paciente desde {new Date(patient?.registration_date).getFullYear()}</span>
                <span className="px-4 py-2 bg-[#A8D1C3]/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#629483]">{appointments.length} Citas totales</span>
              </div>
            </div>
          </section>

          {/* NAVEGACIÓN TABS */}
          <div className="flex gap-12 border-b border-gray-100 px-10">
            {['historial', 'estudios', 'pagos'].map((tab: any) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-[#4A3737]' : 'text-gray-300 hover:text-[#4A3737]/60'}`}>
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#F4B6B6] rounded-full animate-scale-up"></div>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              
              {/* VISTA HISTORIAL (LA QUE TE SALÍA VACÍA) */}
              {activeTab === 'historial' && (
                <div className="space-y-6 animate-fade-in">
                  {appointments.length > 0 ? (
                    <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-gray-50 relative overflow-hidden">
                      <div className="absolute left-16 top-0 bottom-0 w-px bg-gray-100 hidden md:block"></div>
                      <div className="space-y-12">
                        {appointments.map((app, i) => (
                          <div key={i} className="flex flex-col md:flex-row gap-8 relative z-10 group">
                            {/* Fecha/Icono del Timeline */}
                            <div className="md:w-12 flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${app.status === 'attended' ? 'bg-[#A8D1C3] text-white' : 'bg-white border border-gray-100 text-gray-300'}`}>
                                {app.status === 'attended' ? <CheckCircleIcon className="w-6 h-6"/> : <ClockIcon className="w-6 h-6"/>}
                              </div>
                            </div>
                            {/* Contenido de la Cita */}
                            <div className="flex-1 bg-[#F7F5F5]/50 p-8 rounded-[2.5rem] border border-transparent hover:border-[#F4B6B6]/20 transition-all">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-black text-[#F4B6B6] uppercase tracking-widest">
                                  {new Date(app.appointment_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${app.status === 'attended' ? 'bg-[#A8D1C3]/20 text-[#629483]' : 'bg-gray-100 text-gray-400'}`}>
                                  {app.status === 'attended' ? 'Completada' : 'Pendiente'}
                                </span>
                              </div>
                              <h4 className="text-2xl font-serif italic text-[#4A3737]">{app.title || "Revisión General"}</h4>
                              <p className="text-xs text-gray-400 mt-2 font-medium italic">Atendido en Luminous Sanctuario Dental</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* EMPTY STATE: POR SI NO HAY CITAS */
                    <div className="bg-white rounded-[4rem] p-20 shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="p-6 bg-[#F7F5F5] rounded-full text-gray-200">
                        <CalendarIcon className="w-16 h-16" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-serif italic text-[#4A3737]">Sin historial aún</h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">Este paciente todavía no tiene citas registradas en el sistema.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VISTA ESTUDIOS Y PAGOS SE QUEDAN IGUAL... */}
              {activeTab === 'estudios' && (
                /* ... tu código de estudios ... */
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 animate-fade-in">
                   {/* Botón subir */}
                   <div className="aspect-square bg-white rounded-[3rem] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 text-gray-300 hover:border-[#F4B6B6] transition-all cursor-pointer group shadow-sm">
                    <CameraIcon className="w-10 h-10 group-hover:scale-110" />
                    <span className="text-[10px] font-bold mt-4 uppercase">Subir</span>
                  </div>
                  {studies.map((std) => (
                    <div key={std.id} className="aspect-square bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm group relative">
                      {std.file_type === 'pdf' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#F7F5F5] p-6 text-center">
                          <DocumentIcon className="w-14 h-14 text-[#F4B6B6] mb-2" />
                          <span className="text-[9px] font-bold uppercase truncate w-full">{std.title}</span>
                        </div>
                      ) : (
                        <img src={std.file_url} className="w-full h-full object-cover" alt="estudio" />
                      )}
                      <div className="absolute inset-0 bg-[#4A3737]/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-8 backdrop-blur-sm text-white">
                        <a href={std.file_url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-[#F4B6B6] text-[#4A3737] rounded-2xl text-[9px] font-bold uppercase tracking-widest shadow-lg">Abrir</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'pagos' && (
                /* ... tu código de pagos ... */
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 border border-gray-50">
                      <div className="p-4 bg-[#A8D1C3]/10 text-[#A8D1C3] rounded-2xl"><BanknotesIcon className="w-8 h-8"/></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Pagado</p>
                        <p className="text-3xl font-serif italic text-[#4A3737]">${totalPaid.toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsPaymentModalOpen(true)} className="bg-[#4A3737] p-8 rounded-[2.5rem] text-white shadow-xl hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all flex items-center justify-center gap-4 group font-bold uppercase text-[12px] tracking-widest">
                      <PlusIcon className="w-8 h-8 group-hover:rotate-90 transition-transform" /> Registrar Pago
                    </button>
                  </div>
                  <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden text-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-widest text-gray-400">Fecha</th>
                          <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-widest text-gray-400">Concepto</th>
                          <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-widest text-gray-400 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {payments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-10 py-5 text-[10px] font-bold text-gray-300">{new Date(pay.created_at).toLocaleDateString()}</td>
                            <td className="px-10 py-5 font-serif italic text-[#4A3737]">{pay.description}</td>
                            <td className="px-10 py-5 text-right font-serif italic text-lg text-[#4A3737]">${pay.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ASIDE DE ALERTAS MÉDICAS (SIEMPRE VISIBLE) */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-[#4A3737] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-[#F4B6B6]" />
                    <h4 className="text-xl font-serif italic">Alertas Médicas</h4>
                  </div>
                  <button onClick={() => setIsNoteModalOpen(true)} className="p-2 bg-white/10 hover:bg-[#F4B6B6] hover:text-[#4A3737] rounded-xl transition-all"><PlusIcon className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar relative z-10">
                  {medicalNotes.length > 0 ? medicalNotes.map((note) => (
                    <div key={note.id} className={`p-5 rounded-3xl border ${note.category === 'alergia' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${note.category === 'alergia' ? 'bg-rose-500 text-white shadow-md shadow-rose-900/40' : 'bg-[#F4B6B6] text-[#4A3737]'}`}>{note.category}</span>
                        <span className="text-[8px] text-white/30 font-bold">{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm italic text-white/90 leading-relaxed">{note.content}</p>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-white/20">Sin alertas registradas</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* MODALES IGUALES... */}
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#4A3737]/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl p-10 animate-slide-up">
              <h3 className="text-3xl font-serif italic text-[#4A3737] mb-8">Nueva Alerta Médica</h3>
              <div className="space-y-6">
                <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
                  {['alergia', 'observacion'].map(cat => (
                    <button key={cat} onClick={() => setNewNote({...newNote, category: cat as any})} className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all ${newNote.category === cat ? 'bg-[#4A3737] text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>{cat}</button>
                  ))}
                </div>
                <textarea value={newNote.content} onChange={(e) => setNewNote({...newNote, content: e.target.value})} placeholder="Ej: Alérgico a la penicilina..." className="w-full p-6 bg-[#F7F5F5] border border-gray-100 rounded-[2rem] outline-none text-sm h-32 resize-none focus:border-[#F4B6B6] transition-all" />
                <button onClick={handleAddNote} disabled={isSubmitting} className="w-full py-5 bg-[#4A3737] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#F4B6B6] hover:text-[#4A3737] shadow-xl transition-all active:scale-95 disabled:opacity-50">Guardar Alerta</button>
                <button onClick={() => setIsNoteModalOpen(false)} className="w-full text-gray-300 font-bold uppercase text-[9px] tracking-widest">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PAGO IGUAL... */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#4A3737]/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl p-10 animate-slide-up">
              <h3 className="text-3xl font-serif italic text-[#4A3737] mb-8">Registrar Cobro</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-4 tracking-widest">Monto</label>
                  <input type="number" value={newPayment.amount} onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})} className="w-full p-5 bg-[#F7F5F5] border border-gray-100 rounded-2xl outline-none text-2xl font-serif italic focus:border-[#F4B6B6]" placeholder="$ 0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-4 tracking-widest">Concepto</label>
                  <input type="text" value={newPayment.description} onChange={(e) => setNewPayment({...newPayment, description: e.target.value})} className="w-full p-5 bg-[#F7F5F5] border border-gray-100 rounded-2xl outline-none text-sm font-medium" placeholder="Ej: Limpieza dental" />
                </div>
                <button onClick={handleAddPayment} disabled={isSubmitting} className="w-full py-5 bg-[#4A3737] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#F4B6B6] hover:text-[#4A3737] shadow-xl transition-all">Confirmar Pago</button>
                <button onClick={() => setIsPaymentModalOpen(false)} className="w-full text-gray-300 font-bold uppercase text-[9px] tracking-widest">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};