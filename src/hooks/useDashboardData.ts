import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useDashboardData = () => {
  const [data, setData] = useState<any>({ patient: null, nextAppointment: null, payments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const [profile, appointment, payments] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('appointments').select('*').eq('patient_id', user.id).gte('appointment_date', new Date().toISOString()).order('appointment_date').limit(1).single(),
            supabase.from('payments').select('*').eq('patient_id', user.id).order('created_at', { ascending: false })
          ]);

          setData({
            patient: profile.data,
            nextAppointment: appointment.data,
            payments: payments.data || []
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return { ...data, loading };
};