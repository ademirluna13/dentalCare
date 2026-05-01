import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      // --- REGISTRO DE PACIENTES ---
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { full_name: fullName } 
        }
      });
      if (error) {
        alert("Error al registrar: " + error.message);
      } else {
        alert("¡Cuenta creada! Revisa tu correo para verificar tu acceso.");
      }
    } else {
      // --- LOGIN CON REDIRECCIÓN DE PODER (ROLES) ---
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        alert("Acceso denegado: " + error.message);
      } else if (data.user) {
        
        // 1. Consultamos el perfil para verificar el nivel de acceso
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          console.error("Error de perfil:", profileError);
          navigate('/dashboard'); // Fallback a paciente
          return;
        }

        // 2. SISTEMA DE RUTEO POR ROL
        switch (profile.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'secretary':
            navigate('/secretaria/dashboard');
            break;
          case 'doctor':
            navigate('/dentista/dashboard');
            break;
          default:
            navigate('/dashboard'); // Portal del Paciente
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decoración de fondo sutil */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FCECEC] rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F4B6B6]/10 rounded-full blur-[100px] opacity-30" />

      <div className="w-full max-w-md bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-gray-50 relative z-10 transition-all duration-500">
        
        <div className="text-center mb-10 text-[#4A3737]">
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight">
            {isRegistering ? 'Crear Cuenta' : 'Santuario Dental'}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F4B6B6] mt-4">
            Luminous Cloud Portal
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isRegistering && (
            <div className="space-y-2 text-left px-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-2">Nombre Completo</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-8 py-4 bg-[#F8F7F4] border border-transparent rounded-full focus:border-[#F4B6B6] focus:bg-white outline-none transition-all text-sm text-[#4A3737]"
                placeholder="Ej. Ademir Luna"
                required 
              />
            </div>
          )}
          
          <div className="space-y-2 text-left px-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-2">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-8 py-4 bg-[#F8F7F4] border border-transparent rounded-full focus:border-[#F4B6B6] focus:bg-white outline-none transition-all text-sm text-[#4A3737]"
              placeholder="correo@ejemplo.com"
              required 
            />
          </div>

          <div className="space-y-2 text-left px-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-300 ml-2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-8 py-4 bg-[#F8F7F4] border border-transparent rounded-full focus:border-[#F4B6B6] focus:bg-white outline-none transition-all text-sm text-[#4A3737]"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-6 bg-[#4A3737] text-white rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all duration-300 disabled:opacity-50 active:scale-95 mt-4"
          >
            {loading ? 'Procesando Sincronización...' : isRegistering ? 'Registrar en Luminous' : 'Acceder al Centro de Control'}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-gray-50 pt-8">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
            {isRegistering ? '¿Ya eres parte de la comunidad?' : '¿Nuevo en el santuario?'} <br/>
            <span 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[#F4B6B6] cursor-pointer hover:text-[#4A3737] transition-colors inline-block mt-2 underline underline-offset-4"
            >
              {isRegistering ? 'Inicia Sesión aquí' : 'Crea tu cuenta de paciente'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};