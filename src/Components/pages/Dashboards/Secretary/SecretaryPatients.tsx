import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { supabase } from '../../../../lib/supabase';
import { 
  UserPlusIcon, MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon, EyeIcon, 
  ArrowPathIcon, Squares2X2Icon, 
  Bars3Icon, SparklesIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const SecretaryPatients = () => {
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
      <div className="relative">
        <ArrowPathIcon className="w-12 h-12 text-[#F4B6B6] animate-spin" />
        <div className="absolute inset-0 blur-xl bg-[#F4B6B6]/20 animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] overflow-x-hidden w-full max-w-[100vw]">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-32 lg:pt-16 bg-[#F8F7F4] min-h-screen w-full lg:rounded-l-[4rem] relative z-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in text-[#4A3737]">
          
          {/* --- HEADER --- */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 px-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-[#F4B6B6]" />
                <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[10px] ml-1">Luminous Sanctuary</p>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif italic text-[#4A3737] tracking-tighter leading-none">
                Pacientes <span className="text-[#F4B6B6]">Luminous</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center w-full xl:w-auto">
              {/* TOGGLE DE VISTA ESTILO APPLE */}
              <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-gray-100 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-full transition-all duration-500 ${viewMode === 'grid' ? 'bg-[#4A3737] text-white shadow-xl scale-110' : 'text-gray-300 hover:text-[#4A3737]'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-full transition-all duration-500 ${viewMode === 'list' ? 'bg-[#4A3737] text-white shadow-xl scale-110' : 'text-gray-300 hover:text-[#4A3737]'}`}
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
              </div>

              {/* BÚSQUEDA ESTILO TESLA */}
              <div className="relative w-full sm:w-96 group">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F4B6B6] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar paciente por nombre o teléfono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-white border border-gray-50 rounded-full outline-none text-sm focus:border-[#F4B6B6]/50 focus:ring-4 focus:ring-[#F4B6B6]/5 shadow-sm transition-all"
                />
                <SparklesIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-100" />
              </div>
            </div>
          </header>

          {/* --- VISTA DE CUADRÍCULA --- */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 px-2">
              {filteredPatients.map((p) => (
                <div key={p.id} className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-50 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group relative overflow-hidden">
                  {/* Decoración de fondo sutil */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FCECEC]/20 rounded-full blur-3xl group-hover:bg-[#F4B6B6]/20 transition-all duration-700" />
                  
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="relative mb-8">
                      <div className="w-36 h-36 rounded-[3rem] bg-[#F8F7F4] overflow-hidden border-[6px] border-white shadow-2xl group-hover:border-[#F4B6B6]/10 transition-all duration-500">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#4A3737] text-[#F4B6B6] text-5xl font-serif italic">
                            {p.full_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="text-3xl font-serif italic text-[#4A3737] mb-2">{p.full_name}</h4>
                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] mb-10">{p.phone || 'Sin contacto'}</p>
                    
                    <div className="w-full grid grid-cols-2 gap-4">
                      <a 
                        href={`https://wa.me/52${p.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        className="py-4 bg-[#F8F7F4] rounded-3xl text-gray-400 hover:text-[#25D366] hover:bg-green-50 transition-all flex items-center justify-center gap-2 group/wa"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5 group-hover/wa:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                      </a>
                      <Link 
                        to={`/secretary/patients/${p.id}`}
                        className="py-4 bg-[#4A3737] text-white rounded-3xl hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all shadow-lg flex items-center justify-center gap-2 group/exp"
                      >
                        <EyeIcon className="w-5 h-5 group-hover/exp:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Ver Perfil</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* --- VISTA DE LISTA --- */
            <div className="bg-white rounded-[3.5rem] shadow-xl border border-gray-50 overflow-hidden px-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Paciente</th>
                    <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Teléfono</th>
                    <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Estado</th>
                    <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="group hover:bg-[#FCECEC]/10 transition-all duration-300">
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-[#4A3737] flex items-center justify-center text-[#F4B6B6] font-serif italic overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                            {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.full_name?.charAt(0)}
                          </div>
                          <span className="font-serif italic text-2xl text-[#4A3737]">{p.full_name}</span>
                        </div>
                      </td>
                      <td className="px-12 py-8 text-sm font-bold text-gray-400 tracking-widest">{p.phone}</td>
                      <td className="px-12 py-8">
                        <span className="px-4 py-1.5 bg-[#FCECEC] text-[#F4B6B6] text-[8px] font-black uppercase rounded-full tracking-widest">Activo</span>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <div className="flex justify-end gap-4">
                           <Link to={`/secretary/patients/${p.id}`} className="p-4 bg-[#F8F7F4] text-[#4A3737] rounded-2xl hover:bg-[#4A3737] hover:text-white transition-all shadow-sm"><EyeIcon className="w-5 h-5"/></Link>
                           <a href={`https://wa.me/52${p.phone?.replace(/\D/g, '')}`} target="_blank" className="p-4 bg-[#F8F7F4] text-gray-300 hover:text-[#25D366] hover:bg-green-50 rounded-2xl transition-all shadow-sm"><ChatBubbleLeftRightIcon className="w-5 h-5"/></a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredPatients.length === 0 && (
            <div className="py-32 text-center space-y-4">
              <div className="text-6xl text-gray-100 font-serif italic">Sin resultados</div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Intenta con otro nombre o criterio de búsqueda</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};