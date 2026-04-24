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
      // REGISTRO
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { full_name: fullName } // Esto es lo que el Trigger de SQL usará
        }
      });
      if (error) alert("Error al registrar: " + error.message);
      else alert("¡Cuenta creada! Revisa tu correo o intenta iniciar sesión.");
    } else {
      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Credenciales incorrectas: " + error.message);
      else navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-neutral bg-grain flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-brand-primary/20 shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif italic text-brand-dark">
            {isRegistering ? 'Únete a Luminous' : 'Bienvenido de Vuelta'}
          </h2>
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-primary mt-2">
            Patient Portal
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Nombre Completo</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-6 py-3 bg-brand-neutral/50 border border-brand-primary/10 rounded-full focus:border-brand-primary outline-none transition-all text-sm"
                placeholder="Elena Luna"
                required 
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-3 bg-brand-neutral/50 border border-brand-primary/10 rounded-full focus:border-brand-primary outline-none transition-all text-sm"
              placeholder="tu@correo.com"
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-3 bg-brand-neutral/50 border border-brand-primary/10 rounded-full focus:border-brand-primary outline-none transition-all text-sm"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-brand-dark text-white rounded-full font-sans font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg hover:bg-brand-primary hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isRegistering ? 'Crear mi Santuario' : 'Entrar al Santuario'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-sans text-brand-dark/40 uppercase tracking-widest">
            {isRegistering ? '¿Ya tienes cuenta?' : '¿Eres nuevo paciente?'} {' '}
            <span 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-brand-primary cursor-pointer hover:underline font-bold"
            >
              {isRegistering ? 'Inicia Sesión' : 'Regístrate aquí'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};