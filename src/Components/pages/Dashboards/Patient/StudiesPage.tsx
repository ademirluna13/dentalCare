// src/pages/dashboards/Patient/StudiesPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Sidebar } from '../../../Shared/Sidebar';
import { DocumentIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export const StudiesPage = () => {
  const [studies, setStudies] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // --- LÍMITE DE PESO: 5MB ---
  const MAX_FILE_SIZE = 5 * 1024 * 1024; 

  const fetchStudies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('studies')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });
    setStudies(data || []);
  };

  useEffect(() => { fetchStudies(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // EL CADENERO: Validar peso
    if (file.size > MAX_FILE_SIZE) {
      Swal.fire({
        title: '¡Archivo muy pesado!',
        text: 'Marlboro, el límite por estudio es de 5MB. Comprime el PDF o usa una imagen más ligera.',
        icon: 'error',
        confirmButtonColor: '#C5A491'
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Subir al Storage
      const { error: uploadError } = await supabase.storage
        .from('patient-studies')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('patient-studies')
        .getPublicUrl(filePath);

      // 3. Registrar en la DB
      await supabase.from('studies').insert({
        patient_id: user?.id,
        title: file.name,
        file_url: publicUrl,
        file_type: fileExt,
        file_size: file.size
      });

      Swal.fire('¡Subido!', 'Tu estudio ya está en el santuario.', 'success');
      fetchStudies();
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-neutral bg-grain">
      <Sidebar />
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-6xl font-serif italic text-brand-dark leading-none">Mis Estudios</h1>
              <p className="text-brand-dark/40 uppercase tracking-widest text-[10px] font-bold mt-4">Radiografías, Recetas y Resultados</p>
            </div>

            {/* BOTÓN DE SUBIDA MAMALÓN */}
            <label className="cursor-pointer group">
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              <div className="flex items-center gap-3 px-8 py-4 bg-brand-dark text-white rounded-full hover:bg-brand-primary transition-all shadow-xl">
                <ArrowUpTrayIcon className={`w-5 h-5 ${uploading ? 'animate-bounce' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {uploading ? 'Subiendo...' : 'Subir Estudio'}
                </span>
              </div>
            </label>
          </header>

          {/* GRID DE ARCHIVOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studies.map((s) => (
              <a 
                key={s.id} 
                href={s.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-brand-primary/10 hover:border-brand-primary/40 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                    <DocumentIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif italic text-lg text-brand-dark truncate">{s.title}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/30">
                      {s.file_type} • {(s.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </a>
            ))}

            {studies.length === 0 && !uploading && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-brand-primary/20 rounded-[4rem]">
                <DocumentIcon className="w-12 h-12 text-brand-primary/20 mx-auto mb-4" />
                <p className="font-serif italic text-brand-dark/30 text-2xl">Aún no hay documentos en tu santuario.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};