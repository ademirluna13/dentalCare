import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../Shared/Sidebar';
import { 
  MagnifyingGlassIcon, 
  MapIcon, 
  UserIcon, 
  SparklesIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export const OdontogramIndex = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          avatar_url,
          role,
          odontograms!fk_luminous_odontogram ( id )
        `)
        .eq('role', 'patient');

      if (error) throw error;
      if (data) setPatients(data);
    } catch (err) {
      console.error("Error crítico de sincronización");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] w-full">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12 pt-28 lg:pt-16 w-full max-w-[1600px] mx-auto overflow-hidden">
        <div className="space-y-10 lg:space-y-14 animate-fade-in text-[#4A3737]">
          
          {/* HEADER PREMIUM */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B6B6]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="relative z-10 text-left flex-shrink-0 w-full xl:w-auto">
              <div className="flex items-center gap-3 mb-2 flex-nowrap whitespace-nowrap">
                <div className="h-[1px] w-8 bg-[#F4B6B6] shrink-0" />
                <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px] flex items-center gap-2">
                  <MapIcon className="w-4 h-4 shrink-0" /> Mapeo Clínico Luminous
                </p>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif italic tracking-tighter leading-none">Índice <span className="text-[#F4B6B6]">Dental</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mt-4 ml-1">Cartografía de sonrisas • {patients.length} Expedientes</p>
            </div>

            {/* BUSCADOR BLINDADO */}
            <div className="relative group w-full xl:w-96 relative z-10 shrink-0">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F4B6B6] transition-colors shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                className="w-full pl-14 pr-8 py-5 bg-[#F8F7F4] border border-gray-100 rounded-full outline-none text-sm font-medium focus:border-[#F4B6B6] focus:bg-white shadow-inner transition-all placeholder:text-gray-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          {/* GRID DE CARDS */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <ArrowPathIcon className="w-12 h-12 text-[#F4B6B6] animate-spin stroke-[2]" />
              <p className="font-serif italic text-gray-400 text-lg">Sincronizando mapas dentales...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
              {filteredPatients.map((patient) => {
                const hasOdontogram = patient.odontograms && (
                  Array.isArray(patient.odontograms) 
                    ? patient.odontograms.length > 0 
                    : Object.keys(patient.odontograms).length > 0
                );
                
                return (
                  <div 
                    key={patient.id} 
                    onClick={() => navigate(`/dentista/odontogramas/${patient.id}`)}
                    className="group bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col items-center min-h-[420px]"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100%] transition-colors duration-700 ${hasOdontogram ? 'bg-[#FCECEC]/30 group-hover:bg-[#F4B6B6]/10' : 'bg-gray-50/50 group-hover:bg-gray-100/50'}`} />

                    <div className="flex flex-col items-center text-center space-y-6 relative z-10 w-full mt-4 flex-1">
                      
                      {/* AVATAR */}
                      <div className="relative group-hover:-translate-y-1 transition-transform duration-500 shrink-0">
                        <div className={`w-28 h-28 md:w-32 md:h-32 rounded-[2.5rem] overflow-hidden flex items-center justify-center font-serif italic text-5xl shadow-xl border-[6px] border-white transition-all ${hasOdontogram ? 'bg-[#4A3737] text-[#F4B6B6]' : 'bg-[#F8F7F4] text-gray-200'}`}>
                          {patient.avatar_url ? (
                            <img src={patient.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{patient.full_name?.charAt(0)}</span>
                          )}
                        </div>
                        {hasOdontogram && (
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#629483] rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-fade-in shrink-0">
                            <CheckBadgeIcon className="w-5 h-5 text-white shrink-0" />
                          </div>
                        )}
                      </div>
                      
                      {/* TEXTOS Y BADGE BLINDADOS PERO FLEXIBLES */}
                      <div className="space-y-3 w-full flex flex-col items-center flex-1">
                        <h3 className="text-2xl md:text-3xl font-serif italic text-[#4A3737] leading-tight px-2 text-balance line-clamp-2 w-full text-center">
                           {patient.full_name}
                        </h3>
                        
                        <div className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-colors flex-nowrap whitespace-nowrap shrink-0 ${hasOdontogram ? 'bg-[#FCECEC] border-[#F4B6B6]/20 text-[#F4B6B6]' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                          <span>{hasOdontogram ? 'Mapa Activo' : 'Sin Registro'}</span>
                        </div>
                      </div>

                      {/* BOTÓN PUFFY ACTION FIX */}
                      <div className="w-full pt-6 mt-auto">
                        <div className={`w-full py-5 px-3 rounded-full text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm flex-nowrap whitespace-nowrap ${hasOdontogram ? 'bg-[#4A3737] text-white group-hover:bg-[#F4B6B6] group-hover:text-[#4A3737]' : 'bg-[#F8F7F4] text-gray-400 group-hover:bg-[#4A3737] group-hover:text-white'}`}>
                          <SparklesIcon className="w-4 h-4 shrink-0 stroke-[2.5]" />
                          <span>{hasOdontogram ? 'Abrir Odontograma' : 'Iniciar Exploración'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:rotate-12 transition-all duration-700 pointer-events-none shrink-0">
                      <ArchiveBoxIcon className="w-48 h-48" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SIN RESULTADOS */}
          {filteredPatients.length === 0 && !loading && (
            <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-gray-100 shadow-inner">
               <UserIcon className="w-20 h-20 text-gray-100 mx-auto mb-6 shrink-0" />
               <p className="font-serif italic text-gray-300 text-3xl">No hay coincidencias en el radar.</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mt-4">Prueba con otro nombre o apellido</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};