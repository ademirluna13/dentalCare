import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { ArrowUpTrayIcon, UserIcon } from '@heroicons/react/24/outline';

interface AvatarUploadProps {
  uid: string;
  url: string | null;
  onUpload: (url: string) => void;
}

export const AvatarUpload = ({ uid, url, onUpload }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen, pa.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Creamos una ruta única por usuario: 'uid/avatar.png'
      const filePath = `${uid}/avatar.${fileExt}`;

      // 1. Subimos la imagen a Supabase Storage (usando upsert para reemplazar si ya existe)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Obtenemos la URL pública de la imagen recien subida
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Actualizamos la dirección de la foto en la tabla 'profiles'
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', uid);

      if (updateError) throw updateError;

      // 4. Avisamos al componente padre que ya quedó lista la URL
      onUpload(publicUrl);
      alert("¡Foto actualizada!");

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group w-32 h-32 mx-auto">
      {/* El Círculo del Avatar con borde Rose Gold */}
      <div className="w-full h-full rounded-full overflow-hidden border-4 border-brand-primary/20 shadow-xl shadow-brand-primary/10 bg-white flex items-center justify-center relative z-10">
        {url ? (
          <img src={url} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <UserIcon className="w-16 h-16 text-brand-neutral-dark/30" />
        )}
      </div>

      {/* El botón superpuesto al hacer hover */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 bg-brand-dark/70 rounded-full z-20 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer disabled:opacity-50"
      >
        <ArrowUpTrayIcon className="w-8 h-8 mb-1" />
        <span className="text-[9px] font-bold uppercase tracking-widest">
          {uploading ? 'Subiendo...' : 'Cambiar'}
        </span>
      </button>

      {/* Input de archivo oculto */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};