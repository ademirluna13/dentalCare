import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useSecretaryData = (filterDate: string) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ todayCount: 0, waitingCount: 0, attendedCount: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Filtro de fecha para el día completo (UTC)
    const start = `${filterDate}T00:00:00.000Z`;
    const end = `${filterDate}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        status,
        title,
        profiles!patient_id (
          full_name
        )
      `)
      .gte('appointment_date', start)
      .lte('appointment_date', end)
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error("Error en Hook:", error.message);
    } else {
      setAppointments(data || []);
      setStats({
        todayCount: data.length,
        waitingCount: data.filter(a => a.status === 'scheduled').length,
        attendedCount: data.filter(a => a.status === 'attended').length,
        revenue: 0 // Se integrará cuando hagamos la tabla de pagos
      });
    }
    setLoading(false);
  }, [filterDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { appointments, stats, loading, refresh: fetchData };
};