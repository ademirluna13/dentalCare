// src/hooks/usePatientHistory.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 1. Definimos qué es una Cita y qué es un Pago
interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  status: string;
  doctor_name: string;
}

interface Payment {
  id: string;
  description: string;
  amount: number;
  status: string;
  created_at: string;
}

export const usePatientHistory = () => {
  // 2. Le pasamos el tipo al useState <Tipo[]>
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [appRes, payRes] = await Promise.all([
          supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', user.id)
            .order('appointment_date', { ascending: false }),
          supabase
            .from('payments')
            .select('*')
            .eq('patient_id', user.id)
            .order('created_at', { ascending: false })
        ]);

        // Ahora TS ya sabe que estos arreglos son compatibles
        setAppointments(appRes.data || []);
        setPayments(payRes.data || []);
      } catch (err) {
        console.error("Error cargando historial:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return { appointments, payments, loading };
};