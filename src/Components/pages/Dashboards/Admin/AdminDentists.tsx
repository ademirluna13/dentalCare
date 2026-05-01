import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { supabase } from '../../../../lib/supabase';
import { 
  MagnifyingGlassIcon, PhoneIcon, 
  EnvelopeIcon, AcademicCapIcon, 
  MapPinIcon, CalendarIcon, SparklesIcon,
  PlusIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export const AdminDentists = () => {
  const [dentists, setDentists] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // --- CATÁLOGOS Y DÍAS (CORRECCIÓN DE TYPESCRIPT APLICADA) ---
  const [catalogos, setCatalogos] = useState<{
    especialidades: any[];
    consultorios: any[];
  }>({ especialidades: [], consultorios: [] });
  
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // --- ESTADOS PARA EL MODAL INTELIGENTE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialForm = {
    id: null,
    nombres: '',
    apellidos: '',
    especialidad: '',
    cedula_profesional: '',
    telefono: '',
    email: '',
    password: '', // <-- Agregado para el RPC (Crear cuenta)
    dias_atencion: '',
    consultorio_asignado: '',
    activo: true
  };
  const [formData, setFormData] = useState<any>(initialForm);

  const fetchDentists = async () => {
    setLoading(true);
    try {
      // 1. Traer Dentistas
      const { data: docs, error: errDocs } = await supabase
        .from('dentists')
        .select('*')
        .order('nombres', { ascending: true });
      if (errDocs) throw errDocs;
      if (docs) setDentists(docs);

      // 2. Traer Catálogos para el Modal
      const { data: esp } = await supabase.from('catalogo_especialidades').select('nombre');
      const { data: cons } = await supabase.from('catalogo_consultorios').select('nombre');
      
      setCatalogos({
        especialidades: esp || [],
        consultorios: cons || []
      });

    } catch (err) {
      console.error("Error al cargar el cuerpo médico o catálogos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDentists(); }, []);

  const filteredDentists = dentists.filter(d => 
    d.nombres?.toLowerCase().includes(search.toLowerCase()) ||
    d.apellidos?.toLowerCase().includes(search.toLowerCase()) ||
    d.especialidad?.toLowerCase().includes(search.toLowerCase())
  );

  // --- LÓGICA DEL MODAL ---
  const openNewModal = () => {
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (doctor: any) => {
    setFormData(doctor);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleDiaChange = (dia: string) => {
    // Convierte el string "Lunes, Martes" en un arreglo
    let diasActuales = formData.dias_atencion ? formData.dias_atencion.split(', ').filter(Boolean) : [];
    
    if (diasActuales.includes(dia)) {
      diasActuales = diasActuales.filter((d: string) => d !== dia);
    } else {
      diasActuales.push(dia);
    }
    
    setFormData((prev: any) => ({ ...prev, dias_atencion: diasActuales.join(', ') }));
  };

  const handleSaveDentist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación: Si es nuevo, exige contraseña.
    if (!formData.nombres || !formData.apellidos || !formData.especialidad || (!formData.id && !formData.password)) {
      Swal.fire('Faltan Datos', 'Revisa los campos obligatorios. Recuerda que los médicos nuevos necesitan una contraseña temporal.', 'warning');
      return;
    }

    try {
      if (formData.id) {
        // --- MODO EDITAR (Update normal a la tabla dentists) ---
        // Le quitamos el password y otros datos que no van en esta tabla
        const { id, created_at, profile_id, password, ...updateData } = formData;
        const { error } = await supabase.from('dentists').update(updateData).eq('id', id);
        
        if (error) throw error;
        Swal.fire('¡Actualizado!', 'Los datos del expediente se guardaron al chaz.', 'success');
      } else {
        // --- MODO NUEVO: LLAMADA A LA FUNCIÓN RPC ---
        const { error } = await supabase.rpc('registrar_dentista_completo', {
          p_email: formData.email,
          p_password: formData.password,
          p_nombres: formData.nombres,
          p_apellidos: formData.apellidos,
          p_especialidad: formData.especialidad,
          p_cedula: formData.cedula_profesional || null,
          p_telefono: formData.telefono || null,
          p_dias: formData.dias_atencion || null,
          p_consultorio: formData.consultorio_asignado || null
        });
        
        if (error) throw error;
        Swal.fire('¡Médico Registrado!', 'Expediente creado y cuenta de acceso generada con éxito.', 'success');
      }
      
      setIsModalOpen(false);
      fetchDentists(); 
    } catch (error: any) {
      console.error("Error al guardar:", error);
      Swal.fire('Error', `Falla en el servidor: ${error.message}`, 'error');
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4]">
      <div className="relative">
        <SparklesIcon className="w-12 h-12 text-[#F4B6B6] animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] text-[#4A3737] overflow-x-hidden w-full">
      <Sidebar />
      
      <main className="flex-1 lg:pl-72 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-16">
          
          {/* HEADER */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-[#F4B6B6]" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Directorio Interno</p>
              </div>
              <h1 className="text-5xl lg:text-7xl font-serif italic tracking-tighter">
                Cuerpo <span className="text-[#F4B6B6]">Médico</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto">
              <button 
                onClick={openNewModal}
                className="flex items-center gap-2 px-8 py-5 bg-[#4A3737] text-white hover:bg-[#F4B6B6] hover:text-[#4A3737] rounded-full transition-all duration-300 font-bold text-[10px] uppercase tracking-widest shadow-xl w-full sm:w-auto justify-center group"
              >
                <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Nuevo Especialista
              </button>

              <div className="relative w-full sm:w-80 group">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F4B6B6] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o especialidad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-full outline-none text-sm focus:ring-4 focus:ring-[#F4B6B6]/20 shadow-sm transition-all text-[#4A3737] font-medium"
                />
              </div>
            </div>
          </header>

          {/* GRID DE ESPECIALISTAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 pb-10">
            {filteredDentists.map((doc) => (
              <div 
                key={doc.id} 
                onClick={() => openEditModal(doc)}
                className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-[#F4B6B6]/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group cursor-pointer"
              >
                {/* STATUS INDICATOR */}
                <div className="absolute top-8 right-8 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${doc.activo ? 'bg-[#629483]' : 'bg-red-400'} animate-pulse`} />
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">
                    {doc.activo ? 'Operativo' : 'Inactivo'}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center mt-4">
                  {/* AVATAR */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-[#F8F7F4] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden group-hover:border-[#F4B6B6]/30 transition-all duration-500">
                      <span className="text-5xl font-serif italic text-[#4A3737] opacity-50">
                        {doc.nombres.charAt(0)}{doc.apellidos.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#4A3737] text-white px-4 py-1.5 rounded-full shadow-lg">
                      <p className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                        {doc.especialidad}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-3xl font-serif italic text-[#4A3737] mt-4 mb-1">
                    Dr. {doc.nombres.split(' ')[0]} {doc.apellidos.split(' ')[0]}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1 mb-8">
                    <AcademicCapIcon className="w-4 h-4 text-[#F4B6B6]" />
                    Cédula: {doc.cedula_profesional || 'Pendiente'}
                  </p>

                  <div className="w-full bg-[#F8F7F4] rounded-3xl p-5 mb-8 flex flex-col gap-3 text-left group-hover:bg-white transition-colors">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="w-5 h-5 text-[#4A3737] shrink-0" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Días de Atención</p>
                        <p className="text-xs font-bold text-[#4A3737]">{doc.dias_atencion || 'No asignados'}</p>
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-[#4A3737] shrink-0" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Consultorio</p>
                        <p className="text-xs font-bold text-[#4A3737]">{doc.consultorio_asignado || 'Por definir'}</p>
                      </div>
                    </div>
                  </div>

                  {/* BOTONES DE CONTACTO */}
                  <div className="flex gap-4 w-full">
                    <a 
                      href={`tel:${doc.telefono}`}
                      onClick={(e) => e.stopPropagation()} 
                      className="flex-1 py-4 bg-white border-2 border-[#F8F7F4] rounded-2xl flex items-center justify-center hover:border-[#F4B6B6] hover:bg-[#F4B6B6]/5 transition-all group/btn"
                    >
                      <PhoneIcon className="w-5 h-5 text-gray-400 group-hover/btn:text-[#4A3737]" />
                    </a>
                    <a 
                      href={`mailto:${doc.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-4 bg-white border-2 border-[#F8F7F4] rounded-2xl flex items-center justify-center hover:border-[#F4B6B6] hover:bg-[#F4B6B6]/5 transition-all group/btn"
                    >
                      <EnvelopeIcon className="w-5 h-5 text-gray-400 group-hover/btn:text-[#4A3737]" />
                    </a>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- MODAL INTELIGENTE (CREAR / EDITAR) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#4A3737]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl w-full max-w-2xl border border-[#F4B6B6]/30 relative animate-fade-in overflow-y-auto max-h-[90vh]">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-[#F8F7F4] text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="mb-8">
              <h3 className="text-4xl font-serif italic text-[#4A3737]">
                {formData.id ? 'Editar' : 'Nuevo'} <span className="text-[#F4B6B6]">Especialista</span>
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">
                {formData.id ? 'Modifica los datos del expediente' : 'Registra un nuevo miembro del equipo Luminous'}
              </p>
            </div>

            <form onSubmit={handleSaveDentist} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Nombres *</label>
                  <input required name="nombres" value={formData.nombres} onChange={handleInputChange} className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-6 text-[#4A3737] font-bold outline-none focus:ring-2 focus:ring-[#F4B6B6] transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Apellidos *</label>
                  <input required name="apellidos" value={formData.apellidos} onChange={handleInputChange} className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-6 text-[#4A3737] font-bold outline-none focus:ring-2 focus:ring-[#F4B6B6] transition-all" />
                </div>
              </div>

              {/* SELECT DE CATÁLOGO: ESPECIALIDAD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Especialidad *</label>
                  <select 
                    required 
                    name="especialidad" 
                    value={formData.especialidad} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-6 text-[#4A3737] font-bold outline-none focus:ring-2 focus:ring-[#F4B6B6] transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Selecciona una...</option>
                    {catalogos.especialidades.map((e: any, i) => (
                      <option key={i} value={e.nombre}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Cédula Profesional</label>
                  <input name="cedula_profesional" value={formData.cedula_profesional} onChange={handleInputChange} className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-6 text-[#4A3737] font-bold outline-none focus:ring-2 focus:ring-[#F4B6B6] transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Teléfono</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-6 text-[#4A3737] font-bold outline-none focus:ring-2 focus:ring-[#F4B6B6] transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Email * (Para inicio de sesión)</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-6 text-[#4A3737] font-bold outline-none focus:ring-2 focus:ring-[#F4B6B6] transition-all" />
                </div>
              </div>

              {/* ZONA DE CONTRASEÑA: SOLO SE MUESTRA SI ES NUEVO REGISTRO */}
              {!formData.id && (
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Contraseña Temporal *</label>
                    <input required type="text" name="password" value={formData.password} onChange={handleInputChange} placeholder="Ej. Luminous2026" className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-6 text-[#4A3737] font-bold outline-none focus:ring-2 focus:ring-[#F4B6B6] transition-all" />
                    <p className="text-[9px] text-[#F4B6B6] font-bold mt-2 ml-2 tracking-widest uppercase">Comparte esta clave con el médico para que pueda ingresar al sistema.</p>
                  </div>
                </div>
              )}

              {/* CHECKBOXES DE DÍAS Y SELECT DE CONSULTORIO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Días de Atención</label>
                  <div className="flex flex-wrap gap-3 bg-[#F8F7F4] p-4 rounded-2xl">
                    {diasSemana.map(dia => (
                      <label key={dia} className="flex items-center gap-1.5 cursor-pointer hover:bg-white px-2 py-1 rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.dias_atencion?.includes(dia) || false}
                          onChange={() => handleDiaChange(dia)}
                          className="w-4 h-4 accent-[#4A3737]"
                        />
                        <span className="text-xs font-bold text-[#4A3737]">{dia.substring(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-2">Consultorio Asignado</label>
                  <select 
                    name="consultorio_asignado" 
                    value={formData.consultorio_asignado} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-6 text-[#4A3737] font-bold outline-none focus:ring-2 focus:ring-[#F4B6B6] transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Por definir</option>
                    {catalogos.consultorios.map((c: any, i) => (
                      <option key={i} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TOGGLE ACTIVO / INACTIVO (SOLO MODO EDITAR) */}
              {formData.id && (
                <div className="flex items-center gap-3 bg-[#F8F7F4] p-4 rounded-2xl">
                  <input 
                    type="checkbox" 
                    name="activo" 
                    checked={formData.activo} 
                    onChange={handleInputChange} 
                    className="w-5 h-5 accent-[#4A3737]"
                  />
                  <div>
                    <p className="text-sm font-bold text-[#4A3737]">Médico Operativo</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Si lo desactivas, no se le podrán agendar citas.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-[#4A3737] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all shadow-lg"
                >
                  {formData.id ? 'Guardar Cambios' : 'Registrar Médico y Crear Cuenta'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};