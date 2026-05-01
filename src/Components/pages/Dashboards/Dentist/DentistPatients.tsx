import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { supabase } from '../../../../lib/supabase';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  ArrowPathIcon,
  Squares2X2Icon, 
  Bars3Icon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export const DentistPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchPatients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .order('full_name', { ascending: true });

    if (!error && data) setPatients(data);
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4]">
      <div className="flex flex-col items-center gap-4">
        <ArrowPathIcon className="w-12 h-12 text-[#F4B6B6] animate-spin stroke-[2]" />
        <p className="font-serif italic text-gray-400 text-lg">Cargando base de pacientes...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] w-full">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12 pt-28 lg:pt-16 w-full max-w-[1600px] mx-auto overflow-hidden">
        <div className="space-y-10 lg:space-y-14 animate-fade-in text-[#4A3737]">
          
          {/* --- HEADER PREMIUM --- */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B6B6]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="relative z-10 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[1px] w-8 bg-[#F4B6B6]" />
                <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px] flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4" /> Comunidad Luminous
                </p>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif italic tracking-tighter leading-none">Mis <span className="text-[#F4B6B6]">Pacientes</span></h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center w-full xl:w-auto relative z-10">
              
              {/* BUSCADOR GLASSMORPHISM */}
              <div className="relative group flex-1 xl:w-80">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F4B6B6] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o teléfono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-8 py-5 bg-[#F8F7F4] border border-gray-100 rounded-full outline-none text-sm font-medium focus:border-[#F4B6B6] focus:bg-white shadow-inner transition-all placeholder:text-gray-400 text-[#4A3737]"
                />
              </div>

              {/* TOGGLE DE VISTA (Tesla Style) */}
              <div className="flex bg-[#F8F7F4] p-1.5 rounded-full border border-gray-100 shadow-inner flex-shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-4 rounded-full transition-all flex-1 sm:flex-none flex justify-center ${viewMode === 'grid' ? 'bg-[#4A3737] text-white shadow-lg' : 'text-gray-400 hover:text-[#F4B6B6]'}`}
                >
                  <Squares2X2Icon className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-4 rounded-full transition-all flex-1 sm:flex-none flex justify-center ${viewMode === 'list' ? 'bg-[#4A3737] text-white shadow-lg' : 'text-gray-400 hover:text-[#F4B6B6]'}`}
                >
                  <Bars3Icon className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </header>

          {/* --- ESTADO SIN RESULTADOS --- */}
          {filteredPatients.length === 0 && (
             <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-50 shadow-sm">
                <UserIcon className="w-16 h-16 text-gray-200 mx-auto mb-6 stroke-[1]" />
                <h3 className="text-3xl font-serif italic text-gray-300">No se encontraron pacientes</h3>
                <p className="text-xs uppercase tracking-widest font-black text-gray-400 mt-2">Intenta con otro término de búsqueda</p>
             </div>
          )}

          {/* --- VISTA DE CUADRÍCULA (Cards de Lujo) --- */}
          {viewMode === 'grid' && filteredPatients.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredPatients.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => navigate(`/dentista/pacientes/${p.id}`)}
                  className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden flex flex-col items-center justify-between min-h-[380px]"
                >
                  {/* Decoración de fondo */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCECEC]/30 rounded-bl-[100%] transition-colors group-hover:bg-[#F4B6B6]/10" />

                  <div className="flex flex-col items-center text-center relative z-10 w-full mt-2">
                    {/* Avatar con efecto Float */}
                    <div className="relative mb-6 group-hover:-translate-y-1 transition-transform duration-500">
                      <div className={`w-28 h-28 md:w-32 md:h-32 rounded-[2rem] overflow-hidden border-[6px] border-white shadow-xl ${!p.avatar_url ? 'bg-[#F8F7F4] flex items-center justify-center' : ''}`}>
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#F4B6B6] text-5xl font-serif italic">{p.full_name?.charAt(0)}</span>
                        )}
                      </div>
                      {/* ID Médico */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#4A3737] text-white px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest shadow-md">
                        ID: {p.id.split('-')[0]}
                      </div>
                    </div>

                    <h4 className="text-2xl md:text-3xl font-serif italic mb-2 leading-tight text-[#4A3737] px-2">{p.full_name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-6">{p.phone || 'Sin número'}</p>
                  </div>
                  
                  {/* Botón de Acción Integrado */}
                  <div className="w-full relative z-10 mt-auto">
                    <div className="w-full py-5 bg-[#F8F7F4] text-[#4A3737] rounded-[2rem] group-hover:bg-[#F4B6B6] group-hover:text-white transition-colors duration-500 flex items-center justify-center gap-3 shadow-inner">
                      <EyeIcon className="w-5 h-5 stroke-[2]" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Abrir Expediente</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- VISTA DE LISTA (Tabla Minimalista) --- */}
          {viewMode === 'list' && filteredPatients.length > 0 && (
            <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-sm border border-gray-50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left table-auto min-w-[800px]">
                  <thead>
                    <tr className="bg-[#F8F7F4]/50 border-b border-gray-100">
                      <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 w-1/2">Paciente y Contacto</th>
                      <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 w-1/4">ID Clínico</th>
                      <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-right w-1/4">Acceso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPatients.map((p) => (
                      <tr 
                        key={p.id} 
                        onClick={() => navigate(`/dentista/pacientes/${p.id}`)}
                        className="group hover:bg-[#FCECEC]/20 transition-colors cursor-pointer"
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#F8F7F4] flex items-center justify-center text-[#4A3737] font-serif italic text-2xl overflow-hidden shadow-sm border border-white">
                              {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : p.full_name?.charAt(0)}
                            </div>
                            <div>
                               <span className="font-serif italic text-2xl text-[#4A3737] block mb-1">{p.full_name}</span>
                               <span className="text-[10px] font-bold text-gray-400 tracking-widest">{p.phone || 'Sin número registrado'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                            <span className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest border border-gray-100">
                                #{p.id.split('-')[0]}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="inline-flex items-center justify-center p-4 bg-[#F8F7F4] rounded-2xl group-hover:bg-[#4A3737] group-hover:text-white transition-all shadow-sm">
                            <EyeIcon className="w-5 h-5 stroke-[2.5]" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};