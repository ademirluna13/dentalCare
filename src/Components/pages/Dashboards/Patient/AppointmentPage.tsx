// src/pages/dashboards/Patient/AppointmentsPage.tsx
import React from 'react';
import { usePatientHistory } from '../../../../hooks/usePatientHistory';
import { Sidebar } from '../../../Shared/Sidebar';

export const AppointmentsPage = () => {
  const { appointments, loading } = usePatientHistory();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-600 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-neutral">
      <Sidebar />
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          <header>
            <h1 className="text-5xl font-serif italic text-brand-dark">Mis Citas</h1>
            <p className="text-brand-dark/40 uppercase tracking-widest text-[10px] font-bold mt-2">Historial completo del santuario</p>
          </header>

          <div className="bg-white/60 backdrop-blur-md rounded-[3rem] border border-brand-primary/10 overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-brand-primary/5 border-b border-brand-primary/10">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Servicio</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Fecha y Hora</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-dark/60">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-primary/5">
                {appointments.map((app: any) => (
                  <tr key={app.id} className="hover:bg-brand-primary/5 transition-colors">
                    <td className="px-8 py-6 font-serif text-lg text-brand-dark">{app.title}</td>
                    <td className="px-8 py-6 text-sm text-brand-dark/60">
                      {new Date(app.appointment_date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter border ${getStatusStyle(app.status)}`}>
                        {app.status === 'scheduled' ? 'Confirmada' : app.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};