import { Navigate } from 'react-router-dom';
import { useEffect, useState, type JSX } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Checamos si hay sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchamos cambios (por si expira la sesión)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mientras checamos la base de datos, mostramos un loading elegante
  if (loading) {
    return (
      <div className="h-screen bg-brand-neutral flex flex-col items-center justify-center">
        <ArrowPathIcon className="w-10 h-10 text-brand-primary animate-spin mb-4" />
        <p className="font-serif italic text-brand-dark">Verificando acceso...</p>
      </div>
    );
  }

  // Si hay sesión, adelante. Si no, ¡p'afuera!
  return session ? children : <Navigate to="/login" replace />;
};