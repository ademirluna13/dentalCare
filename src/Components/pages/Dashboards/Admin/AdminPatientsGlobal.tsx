import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { supabase } from '../../../../lib/supabase';
import { 
  MagnifyingGlassIcon, ChatBubbleLeftRightIcon, 
  EyeIcon, ArrowPathIcon, Squares2X2Icon, 
  Bars3Icon, SparklesIcon, ArrowDownTrayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const AdminPatientsGlobal = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // El admin prefiere lista por default para ver datos

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // MAGIA ADMIN: Jalamos el paciente Y un conteo de cuántas citas tiene asociadas
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          appointments!patient_id(id)
        `)
        .eq('role', 'patient')
        .order('full_name', { ascending: true });

      if (!error && data) setPatients(data);
    } catch (err) {
      console.error("Falla al traer la base de clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  // --- FUNCIÓN PLUS PARA EL ADMIN: EXPORTAR A EXCEL/CSV ---
  const handleExportCSV = () => {
    const headers = ["Nombre Completo", "Teléfono", "Total de Citas", "Estado"];
    const csvData = filteredPatients.map(p => {
      const totalCitas = p.appointments?.length || 0;
      return `"${p.full_name}","${p.phone || 'Sin registro'}","${totalCitas}","Activo"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...csvData].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Luminous_Pacientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4]">
      <div className="relative">
        <ArrowPathIcon className="w-12 h-12 text-[#F4B6B6] animate-spin" />
        <div className="absolute inset-0 blur-xl bg-[#F4B6B6]/20 animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] overflow-x-hidden w-full text-[#4A3737]">
      <Sidebar />
      
      <main className="flex-1 lg:pl-72 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-16">
          
          {/* --- HEADER NIVEL ADMIN --- */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-[#F4B6B6]" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Base de Datos Global</p>
              </div>
              <h1 className="text-5xl lg:text-6xl font-serif italic tracking-tighter">
                Directorio de <span className="text-[#F4B6B6]">Pacientes</span>
              </h1>
              <p className="text-xs font-bold text-gray-400 mt-4 tracking-widest uppercase">
                {filteredPatients.length} Registros Encontrados
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto">
              
              {/* BOTÓN MÁGICO DE EXPORTACIÓN */}
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-6 py-4 bg-[#629483]/10 text-[#629483] hover:bg-[#629483] hover:text-white rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest shadow-sm w-full sm:w-auto justify-center"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Exportar CSV
              </button>

              {/* TOGGLE DE VISTA */}
              <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-[#4A3737] text-white shadow-md' : 'text-gray-400 hover:text-[#4A3737]'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-[#4A3737] text-white shadow-md' : 'text-gray-400 hover:text-[#4A3737]'}`}
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
              </div>

              {/* BÚSQUEDA */}
              <div className="relative w-full sm:w-80 group">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar paciente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-[#F4B6B6] shadow-sm transition-all text-[#4A3737] font-medium"
                />
              </div>
            </div>
          </header>

          {/* --- VISTA DE CUADRÍCULA --- */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredPatients.map((p) => (
                <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F4B6B6]/10 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#F8F7F4] flex items-center justify-center text-[#F4B6B6] font-serif italic text-3xl overflow-hidden group-hover:bg-[#4A3737] group-hover:text-white transition-colors">
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.full_name?.charAt(0)}
                    </div>
                    {/* BADGE DE CITAS (Métrica Admin) */}
                    <div className="flex items-center gap-1 bg-[#F8F7F4] px-3 py-1.5 rounded-lg">
                      <ChartBarIcon className="w-3 h-3 text-[#4A3737]" />
                      <span className="text-[10px] font-black text-[#4A3737]">{p.appointments?.length || 0}</span>
                    </div>
                  </div>

                  <h4 className="text-xl font-serif italic text-[#4A3737] mb-1 line-clamp-1">{p.full_name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">{p.phone || 'Sin contacto'}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <a href={`https://wa.me/52${p.phone?.replace(/\D/g, '')}`} target="_blank" className="py-3 bg-[#F8F7F4] rounded-xl text-gray-400 hover:text-[#25D366] hover:bg-green-50 transition-colors flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    </a>
                    <Link to={`/admin/patients/${p.id}`} className="py-3 bg-[#4A3737] text-white rounded-xl hover:bg-[#F4B6B6] transition-colors flex items-center justify-center">
                      <EyeIcon className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* --- VISTA DE LISTA (ANALÍTICA) --- */
            <div className="bg-white rounded-[3rem] shadow-sm border border-[#F4B6B6]/10 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8F7F4]">
                    <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 rounded-tl-[3rem]">Paciente</th>
                    <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Contacto</th>
                    <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Historial</th>
                    <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-right rounded-tr-[3rem]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FCECEC]/20 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#F8F7F4] flex items-center justify-center text-[#F4B6B6] font-serif italic text-xl overflow-hidden">
                            {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.full_name?.charAt(0)}
                          </div>
                          <span className="font-bold text-sm text-[#4A3737] uppercase">{p.full_name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-xs font-bold text-gray-400 tracking-widest">{p.phone || 'N/A'}</td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-[#F8F7F4] text-[#4A3737] text-[10px] font-black rounded-lg">
                            {p.appointments?.length || 0} Citas
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3">
                           <a href={`https://wa.me/52${p.phone?.replace(/\D/g, '')}`} target="_blank" className="p-3 bg-[#F8F7F4] text-gray-400 hover:text-[#25D366] hover:bg-green-50 rounded-xl transition-colors"><ChatBubbleLeftRightIcon className="w-4 h-4"/></a>
                           <Link to={`/admin/patients/${p.id}`} className="p-3 bg-[#4A3737] text-white rounded-xl hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-colors"><EyeIcon className="w-4 h-4"/></Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredPatients.length === 0 && !loading && (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-[3rem] mt-8">
              <p className="text-2xl font-serif italic text-gray-400">No se encontraron pacientes.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};