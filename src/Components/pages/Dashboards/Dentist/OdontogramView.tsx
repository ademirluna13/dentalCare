import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { Odontogram } from './Odontogram'; // Importamos el motor
import { Sidebar } from '../../../Shared/Sidebar';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// ESTE ES EL QUE TU APP.TSX ESTÁ BUSCANDO
export const OdontogramView = () => {
  const { id } = useParams(); // Agarra el ID de la URL
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');

  // Jalamos el nombre del paciente para que se vea pro
  useEffect(() => {
    const getPatientInfo = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', id)
        .single();
      
      if (data) setPatientName(data.full_name);
    };

    if (id) getPatientInfo();
  }, [id]);

  return (
    <div className="flex min-h-screen bg-[#F7F5F5]">
      <Sidebar />
      
      <main className="flex-1 ml-72 p-12 text-[#4A3737]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* HEADER DE LA PÁGINA */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dentista/odontograma')}
              className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:border-[#F4B6B6] transition-all group shadow-sm"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-400 group-hover:text-[#4A3737]" />
            </button>
            <div>
              <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[10px] mb-1">Editor Clínico Activo</p>
              <h1 className="text-4xl font-serif italic leading-none">
                Paciente: <span className="text-gray-400">{patientName || 'Cargando...'}</span>
              </h1>
            </div>
          </div>

          {/* EL ODONTOGRAMA (Llamamos al motor y le pasamos el ID) */}
          <div className="animate-slide-up">
            {id ? (
              <Odontogram patientId={id} />
            ) : (
              <div className="bg-white p-20 rounded-[4rem] text-center border border-dashed border-gray-200">
                <p className="font-serif italic text-gray-400 text-xl">ID de paciente no válido.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};