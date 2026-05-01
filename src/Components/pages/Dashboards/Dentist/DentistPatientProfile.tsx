import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { Sidebar } from '../../../Shared/Sidebar';
import { TreatmentManager } from './TreatmentManager'; 
import { 
  ArrowLeftIcon, ExclamationTriangleIcon, DocumentTextIcon,
  ClockIcon, MapIcon, PhotoIcon, PlusIcon, ShieldCheckIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

export const DentistPatientProfile = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<any>(null);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'clinico' | 'legal'>('clinico');

  const fetchPatientData = async () => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
      const { data: notes } = await supabase.from('medical_notes').select('*').eq('patient_id', id).in('category', ['alergia', 'observacion']);
      const { data: records } = await supabase.from('medical_notes').select('*, doctor:profiles!doctor_id(full_name)').eq('patient_id', id).eq('category', 'recomendacion').order('created_at', { ascending: false });
      
      // Jalamos todo de la tabla 'studies'
      const { data: files } = await supabase.from('studies').select('*').eq('patient_id', id).order('created_at', { ascending: false });

      if (profile) setPatient(profile);
      if (notes) setAllergies(notes);
      if (records) setHistory(records);
      if (files) setStudies(files);
    } catch (err) {
      console.error("Error en la carga:", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (id) fetchPatientData(); }, [id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: 'clinico' | 'legal') => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${id}/${category}-${Math.random()}.${fileExt}`;

      // 1. Subir al bucket
      const { error: uploadError } = await supabase.storage.from('patient-files').upload(filePath, file);
      if (uploadError) throw uploadError;

      // 2. Obtener URL
      const { data: { publicUrl } } = supabase.storage.from('patient-files').getPublicUrl(filePath);

      // 3. Insertar en la tabla con la categoría correcta
      const { error: dbError } = await supabase.from('studies').insert([{
        patient_id: id,
        title: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        category: category // <-- Esto ahora sí va a funcionar por el SQL de arriba
      }]);

      if (dbError) throw dbError;
      
      await fetchPatientData(); // Recarga automática
    } catch (error: any) {
      alert("Error al subir: " + error.message);
    } finally { setUploading(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#F7F5F5] flex items-center justify-center font-serif italic text-2xl animate-pulse">Sincronizando Bóveda BitXolo...</div>;

  return (
    <div className="flex min-h-screen bg-[#F7F5F5]">
      <Sidebar />
      <main className="flex-1 ml-72 p-12 text-[#4A3737]">
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
          
          {/* HEADER & INFO PACIENTE */}
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/dentista/pacientes')} className="flex items-center gap-3 text-gray-400 hover:text-[#4A3737] group transition-all">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:border-[#F4B6B6] shadow-sm"><ArrowLeftIcon className="w-5 h-5" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Regresar</span>
            </button>
            <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[10px]">Expediente Oficial Luminous</p>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-50 flex gap-10 items-center overflow-hidden relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-[#F7F5F5] overflow-hidden border-4 border-white shadow-xl">
              {patient?.avatar_url ? <img src={patient.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#4A3737] text-[#F4B6B6] text-4xl font-serif italic">{patient?.full_name?.charAt(0)}</div>}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-serif italic mb-1">{patient?.full_name}</h1>
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">ID: {patient?.id?.split('-')[0]}</p>
            </div>
          </div>

          {/* TABS SWITCHER */}
          <div className="flex gap-12 border-b border-gray-100">
            {['clinico', 'legal'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-6 text-[11px] font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === tab ? 'text-[#4A3737]' : 'text-gray-300'}`}>
                {tab === 'clinico' ? 'Seguimiento Clínico' : 'Documentos Legales'}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4A3737] rounded-t-full" />}
              </button>
            ))}
          </div>

          {/* --- CONTENIDO DINÁMICO --- */}
          {activeTab === 'clinico' ? (
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm">
                  <h3 className="text-2xl font-serif italic mb-8">Bitácora de Evolución</h3>
                  <div className="space-y-10 relative before:absolute before:inset-0 before:left-6 before:h-full before:w-0.5 before:bg-[#FCECEC]">
                    {history.map((record) => (
                      <div key={record.id} className="relative pl-16 group">
                        <div className="absolute left-0 top-2 w-12 h-12 rounded-2xl bg-[#FCECEC] text-[#F4B6B6] flex items-center justify-center z-10 group-hover:bg-[#4A3737] group-hover:text-white transition-all"><ClockIcon className="w-5 h-5" /></div>
                        <div className="p-8 rounded-[2.5rem] bg-[#F7F5F5]/40 border border-gray-50 group-hover:bg-white transition-all">
                          <p className="text-xl font-serif italic">"{record.content}"</p>
                          <p className="text-[9px] font-bold text-gray-400 text-right uppercase mt-4">— Dr. {record.doctor?.full_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-4 space-y-10">
                <TreatmentManager patientId={id as string} />
                <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-serif italic">Estudios</h3>
                    <label className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-[#F4B6B6] hover:text-white transition-all">
                      {uploading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PlusIcon className="w-5 h-5" />}
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'clinico')} />
                    </label>
                  </div>
                  <div className="space-y-3">
                    {studies.filter(s => s.category === 'clinico').map((file) => (
                      <a key={file.id} href={file.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                        <PhotoIcon className="w-6 h-6 text-gray-300" />
                        <span className="text-[9px] font-black uppercase truncate flex-1">{file.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- VISTA LEGAL (EL QUE NO JALABA) --- */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {/* Filtramos los archivos que tengan category 'legal' */}
              {studies.filter(s => s.category === 'legal').map((doc) => (
                <div key={doc.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm group hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
                      <ShieldCheckIcon className="w-7 h-7" />
                    </div>
                    <span className="text-[9px] font-black uppercase bg-green-100 text-green-700 px-4 py-2 rounded-xl">Documento Activo</span>
                  </div>
                  <h4 className="text-2xl font-serif italic mb-6 truncate">{doc.title}</h4>
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="block w-full py-4 bg-[#4A3737] text-white rounded-2xl hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all text-[10px] font-black uppercase text-center">Ver Documento</a>
                </div>
              ))}
              
              {/* BOTÓN PARA SUBIR DOCUMENTO LEGAL NUEVO */}
              <label className="border-2 border-dashed border-gray-100 rounded-[3.5rem] flex flex-col items-center justify-center gap-4 p-10 group hover:border-[#F4B6B6] transition-all cursor-pointer min-h-[280px]">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#FCECEC] group-hover:text-[#F4B6B6] transition-all shadow-inner">
                  {uploading ? <ArrowPathIcon className="w-8 h-8 animate-spin" /> : <PlusIcon className="w-8 h-8" />}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-[#4A3737]">Subir Documento Legal</p>
                  <p className="text-[8px] font-bold text-gray-300 uppercase mt-1">Contratos, Avisos, Firmas</p>
                </div>
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'legal')} />
              </label>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};