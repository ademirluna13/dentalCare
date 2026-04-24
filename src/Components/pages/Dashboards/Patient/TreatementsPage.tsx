// src/pages/dashboards/Patient/TreatmentsPage.tsx
import React from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { TreatmentCard } from '../../../../Components/Dashboards/Patient/TratementsCard';

export const TreatmentsPage = () => {
  // Datos de prueba (Luego los jalas de Supabase)
  const myTreatments = [
    { id: 1, title: "Diseño de Sonrisa", progress: 65, nextStep: "Colocación de carillas temporales", status: "in_progress" },
    { id: 2, title: "Limpieza Ultrasónica", progress: 100, nextStep: "Finalizado", status: "completed" }
  ];

  return (
    <div className="flex min-h-screen bg-brand-neutral bg-grain">
      <Sidebar />
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="space-y-4">
            <h1 className="text-6xl font-serif italic text-brand-dark leading-none">Mi Evolución</h1>
            <p className="text-brand-dark/50 font-light text-lg max-w-2xl">
              Cada paso está diseñado para alcanzar la perfección estética y funcional que mereces.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {myTreatments.map(t => (
              <TreatmentCard key={t.id} {...t} />
            ))}
          </div>

          {/* Sección de Notas del Doctor (Opcional pero mamalón) */}
          <div className="bg-brand-dark p-12 rounded-[4rem] text-white overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <h3 className="text-3xl font-serif italic">Recomendación del Especialista</h3>
              <p className="text-white/60 font-light text-lg max-w-xl">
                "Ademir, vas por excelente camino. Recuerda evitar alimentos muy pigmentados durante las próximas 48 horas para asegurar el brillo de tu diseño."
              </p>
              <p className="text-brand-primary font-bold uppercase tracking-[0.3em] text-[10px]">
                — Dr. Alejandro Ruiz
              </p>
            </div>
            {/* Decoración abstracta al fondo */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px]" />
          </div>

        </div>
      </main>
    </div>
  );
};