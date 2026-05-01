import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Swal from 'sweetalert2';

// 1. CONFIGURACIÓN
type ToothFace = 'occlusal' | 'mesial' | 'distal' | 'vestibular' | 'lingual';

const DIAGNOSTICS: Record<string, { color: string, label: string, desc: string }> = {
  healthy: { color: '#FFFFFF', label: 'Sano', desc: 'Pieza en buen estado' },
  caries: { color: '#F87171', label: 'Caries', desc: 'Requiere tratamiento' },
  restored: { color: '#60A5FA', label: 'Resina', desc: 'Pieza con restauración' },
  extraction: { color: '#1F2937', label: 'Ausente', desc: 'Pieza extraída/faltante' },
};

// 2. COMPONENTE HIJO: EL DIENTE
const Tooth = ({ id, facesData, onFaceClick }: { 
  id: number, 
  facesData: Record<ToothFace, string>, 
  onFaceClick: (face: ToothFace) => void 
}) => {
  const getFaceColor = (face: ToothFace) => {
    const diagnostic = facesData[face] || 'healthy';
    if (facesData['occlusal'] === 'extraction') return DIAGNOSTICS.extraction.color;
    return DIAGNOSTICS[diagnostic].color;
  };

  return (
    <div className="flex flex-col items-center group">
      <span className="text-[10px] font-black text-[#4A3737]/20 mb-2 group-hover:text-[#F4B6B6] transition-colors uppercase">
        {id}
      </span>
      <svg width="38" height="38" viewBox="0 0 50 50" className="drop-shadow-sm transition-transform group-hover:scale-110 cursor-pointer">
        <path d="M10 10 L40 10 L33 17 L17 17 Z" fill={getFaceColor('vestibular')} stroke="#E5E7EB" strokeWidth="0.5" onClick={() => onFaceClick('vestibular')} className="hover:opacity-80 transition-all" />
        <path d="M40 10 L40 40 L33 33 L33 17 Z" fill={getFaceColor('distal')} stroke="#E5E7EB" strokeWidth="0.5" onClick={() => onFaceClick('distal')} className="hover:opacity-80 transition-all" />
        <path d="M10 40 L40 40 L33 33 L17 33 Z" fill={getFaceColor('lingual')} stroke="#E5E7EB" strokeWidth="0.5" onClick={() => onFaceClick('lingual')} className="hover:opacity-80 transition-all" />
        <path d="M10 10 L10 40 L17 33 L17 17 Z" fill={getFaceColor('mesial')} stroke="#E5E7EB" strokeWidth="0.5" onClick={() => onFaceClick('mesial')} className="hover:opacity-80 transition-all" />
        <rect x="17" y="17" width="16" height="16" fill={getFaceColor('occlusal')} stroke="#E5E7EB" strokeWidth="0.5" onClick={() => onFaceClick('occlusal')} className="hover:opacity-80 transition-all" />
        {facesData['occlusal'] === 'extraction' && (
          <g stroke="#FFF" strokeWidth="2" opacity="0.3">
            <line x1="10" y1="10" x2="40" y2="40" />
            <line x1="40" y1="10" x2="10" y2="40" />
          </g>
        )}
      </svg>
    </div>
  );
};

// 3. COMPONENTE PADRE
export const Odontogram = ({ patientId }: { patientId: string }) => {
  const [activeTool, setActiveTool] = useState<string>('caries');
  const [odontogramData, setOdontogramData] = useState<Record<number, Record<ToothFace, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOdontogram = async () => {
      if (!patientId) return;
      setLoading(true);
      try {
        const { data } = await supabase.from('odontograms').select('data').eq('patient_id', patientId).maybeSingle();
        if (data?.data) setOdontogramData(data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOdontogram();
  }, [patientId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('odontograms').upsert({ 
        patient_id: patientId, data: odontogramData, updated_at: new Date().toISOString()
      }, { onConflict: 'patient_id' });
      if (error) throw error;
      Swal.fire({ icon: 'success', title: 'Sincronizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) { Swal.fire('Error', 'No se pudo guardar', 'error'); }
    finally { setIsSaving(false); }
  };

  const handleFaceClick = (toothId: number, face: ToothFace) => {
    const current = odontogramData[toothId] || {};
    if (activeTool === 'extraction') {
      const allExt = { occlusal: 'extraction', mesial: 'extraction', distal: 'extraction', vestibular: 'extraction', lingual: 'extraction' };
      setOdontogramData({ ...odontogramData, [toothId]: allExt });
    } else {
      const next = current[face] === activeTool ? 'healthy' : activeTool;
      setOdontogramData({ ...odontogramData, [toothId]: { ...current, [face]: next } });
    }
  };

  const renderCuadrante = (start: number, end: number, reverse = false) => {
    const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    if (reverse) ids.reverse();
    return (
      <div className="flex gap-1.5 md:gap-3">
        {ids.map(id => (
          <Tooth key={id} id={id} facesData={odontogramData[id] || {}} onFaceClick={(f) => handleFaceClick(id, f)} />
        ))}
      </div>
    );
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-serif italic text-gray-400">Sincronizando dentadura...</div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* BARRA DE HERRAMIENTAS (Top Bar) */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50 flex flex-wrap items-center justify-between gap-8">
        <div className="flex items-center gap-10">
          <div>
            <p className="text-[#F4B6B6] font-black uppercase tracking-[0.3em] text-[9px] mb-1">Herramientas</p>
            <h3 className="text-2xl font-serif italic text-[#4A3737]">Selector de Diagnóstico</h3>
          </div>
          
          <div className="flex gap-3">
            {Object.entries(DIAGNOSTICS).filter(([k]) => k !== 'healthy').map(([key, { color, label }]) => (
              <button 
                key={key} onClick={() => setActiveTool(key)}
                className={`px-6 py-3 rounded-2xl border flex items-center gap-3 transition-all ${activeTool === key ? 'border-[#F4B6B6] bg-[#FCECEC]/40 shadow-inner scale-105' : 'bg-white border-gray-50 hover:bg-gray-50'}`}
              >
                <div className="w-5 h-5 rounded-lg shadow-sm border-2 border-white shrink-0" style={{ backgroundColor: color }}></div>
                <span className={`font-serif italic text-base ${activeTool === key ? 'text-[#4A3737]' : 'text-gray-400'}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave} disabled={isSaving}
          className="px-10 py-4 bg-[#4A3737] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F4B6B6] hover:text-[#4A3737] transition-all shadow-lg disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* ÁREA DEL MAPA (Full Width) */}
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
            <h2 className="text-[12rem] font-serif italic text-[#4A3737] leading-none">Luminous</h2>
        </div>

        <div className="relative z-10 space-y-20 py-10">
          {/* ARCADA SUPERIOR */}
          <div className="flex justify-center gap-8 md:gap-16 relative">
            <div className="absolute inset-y-0 left-1/2 w-px bg-gray-100/60 -translate-x-1/2"></div>
            {renderCuadrante(11, 18, true)}
            {renderCuadrante(21, 28)}
          </div>

          {/* ARCADA INFERIOR */}
          <div className="flex justify-center gap-8 md:gap-16 relative">
            <div className="absolute inset-y-0 left-1/2 w-px bg-gray-100/60 -translate-x-1/2"></div>
            {renderCuadrante(41, 48, true)}
            {renderCuadrante(31, 38)}
          </div>
        </div>

        {/* LEYENDA TÉCNICA */}
        <div className="mt-16 flex justify-center gap-12 opacity-30 select-none">
          {['Caries', 'Resina', 'Ausencia'].map((item, idx) => (
            <div key={item} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em]">
              <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-red-400' : idx === 1 ? 'bg-blue-400' : 'bg-gray-800'}`}></div> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};