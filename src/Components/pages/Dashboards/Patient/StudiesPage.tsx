import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Sidebar } from '../../../Shared/Sidebar';
import { DocumentIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export const StudiesPage = () => {
  const [studies, setStudies] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

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

    if (file.size > MAX_FILE_SIZE) {
      Swal.fire({
        title: '¡Archivo muy pesado!',
        text: 'El límite por estudio es de 5MB. Comprime el archivo para mantener la ligereza del santuario.',
        icon: 'error',
        confirmButtonColor: '#F4B6B6'
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('patient-studies')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('patient-studies')
        .getPublicUrl(filePath);

      await supabase.from('studies').insert({
        patient_id: user?.id,
        title: file.name,
        file_url: publicUrl,
        file_type: fileExt,
        file_size: file.size
      });

      Swal.fire({
        title: '¡Sincronizado!',
        text: 'Tu documento ha sido integrado a la base de datos.',
        icon: 'success',
        confirmButtonColor: '#4A3737'
      });
      fetchStudies();
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    // 🛡️ CONTENEDOR RAIZ: Blindaje contra scroll horizontal
    <div className="flex min-h-screen bg-[#F8F7F4] overflow-x-hidden w-full max-w-[100vw]">
      <Sidebar />
      
      {/* 📱 pt-32 para dar aire a la barra móvil rosa */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-32 lg:pt-12 bg-[#F8F7F4] min-h-screen w-full relative z-10">
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
          
          {/* HEADER: APPLE STYLE RESPONSIVE */}
          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 px-2">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-serif italic text-[#4A3737] leading-none tracking-tighter">
                Mis <span className="text-[#F4B6B6]">Estudios</span>
              </h1>
              <p className="text-[#4A3737]/40 uppercase tracking-[0.3em] text-[9px] font-black ml-1">
                Radiografías • Recetas • Resultados Clínicos
              </p>
            </div>

            {/* BOTÓN DE SUBIDA MAMALÓN - Full width en móvil */}
            <label className="cursor-pointer group w-full md:w-auto">
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              <div className="flex items-center justify-center gap-3 px-8 py-5 bg-[#4A3737] text-white rounded-[2rem] hover:bg-[#F4B6B6] transition-all shadow-2xl active:scale-95">
                <ArrowUpTrayIcon className={`w-5 h-5 ${uploading ? 'animate-bounce' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {uploading ? 'Cifrando...' : 'Subir Documento'}
                </span>
              </div>
            </label>
          </header>

          <hr className="border-[#4A3737]/5 mx-2" />

          {/* GRID DE ARCHIVOS: 1 Col móvil, 3 Col PC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {studies.map((s) => (
              <a 
                key={s.id} 
                href={s.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="bg-white p-8 rounded-[3rem] border border-gray-100 hover:border-[#F4B6B6]/40 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between min-h-[220px]"
              >
                {/* Aura sutil al hover */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#F4B6B6]/5 rounded-full blur-2xl group-hover:bg-[#F4B6B6]/15 transition-all" />

                <div className="relative z-10 flex items-start gap-5">
                  <div className="p-4 bg-[#FCECEC] rounded-2xl text-[#F4B6B6] group-hover:bg-[#4A3737] group-hover:text-white transition-all duration-500">
                    <DocumentIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif italic text-xl text-[#4A3737] leading-tight truncate group-hover:text-clip group-hover:whitespace-normal transition-all">
                      {s.title}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#4A3737]/30">Tipo de archivo</p>
                    <p className="text-[10px] font-bold text-[#F4B6B6] uppercase">{s.file_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#4A3737]/30">Peso</p>
                    <p className="text-[10px] font-bold text-[#4A3737]/60">{(s.file_size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </a>
            ))}

            {/* ESTADO VACÍO: INGENIERÍA MINIMALISTA */}
            {studies.length === 0 && !uploading && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-gray-100 rounded-[4rem] flex flex-col items-center gap-4">
                <div className="p-6 bg-gray-50 rounded-full">
                  <DocumentIcon className="w-12 h-12 text-gray-200" />
                </div>
                <div className="space-y-2">
                  <p className="font-serif italic text-[#4A3737]/30 text-2xl">Santuario de Datos Vacío</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Inicia la secuencia de subida para visualizar estudios</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};