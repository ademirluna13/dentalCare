import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useDashboardData = () => {
  const [data, setData] = useState<any>({ 
    patient: null, 
    nextAppointment: null, 
    payments: [],
    studies: [] // <--- NUEVO: Inicializamos el cajón de los estudios
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Ejecutamos las 4 consultas en paralelo para que vuele
          const [profileRes, appointmentsRes, paymentsRes, studiesRes] = await Promise.all([
            // 1. Perfil
            supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single(),
            
            // 2. Cita activa
            supabase
              .from('appointments')
              .select('*')
              .eq('patient_id', user.id)
              .neq('status', 'cancelled')
              .gte('appointment_date', new Date().toISOString()) 
              .order('appointment_date', { ascending: true })
              .limit(1), 

            // 3. Pagos
            supabase
              .from('payments')
              .select('*')
              .eq('patient_id', user.id)
              .order('created_at', { ascending: false }),

            // 4. NUEVO: Traer los estudios para el repositorio del Dashboard
            supabase
              .from('studies')
              .select('*')
              .eq('patient_id', user.id)
              .order('created_at', { ascending: false })
              .limit(3) // Traemos solo los últimos 3 para el resumen
          ]);

          setData({
            patient: profileRes.data,
            nextAppointment: appointmentsRes.data?.[0] || null,
            payments: paymentsRes.data || [],
            studies: studiesRes.data || [] // <--- CLAVE: Aquí es donde la data pasa al componente
          });
        }
      } catch (error) {
        console.error("Error en la arquitectura del santuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { ...data, loading };
};