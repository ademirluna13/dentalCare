import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { ChevronLeftIcon, ChevronRightIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export const CashHistory = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [closures, setClosures] = useState<any[]>([]);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  useEffect(() => {
    const fetchClosures = async () => {
      const { data } = await supabase
        .from('daily_closures')
        .select('*')
        .gte('closure_date', new Date(year, month, 1).toISOString().split('T')[0])
        .lte('closure_date', new Date(year, month + 1, 0).toISOString().split('T')[0]);
      if (data) setClosures(data);
    };
    fetchClosures();
  }, [month, year]);

  const daysArray = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FCECEC] text-[#4A3737] rounded-2xl font-serif italic font-bold">
            {monthNames[month]} {year}
          </div>
          <h2 className="text-2xl font-serif italic">Historial de Caja</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-3 rounded-xl border border-gray-100 hover:bg-gray-50"><ChevronLeftIcon className="w-5 h-5"/></button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-3 rounded-xl border border-gray-100 hover:bg-gray-50"><ChevronRightIcon className="w-5 h-5"/></button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-4">
        {daysArray.map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayClosure = closures.find(c => c.closure_date === dateStr);
          
          return (
            <div key={day} className={`min-h-[120px] p-4 rounded-[2rem] border transition-all ${
              dayClosure 
                ? (dayClosure.balance >= 0 ? 'bg-green-50/50 border-green-100' : 'bg-rose-50/50 border-rose-100') 
                : 'bg-white border-gray-100 opacity-40'
            }`}>
              <span className="text-[10px] font-black text-gray-300 uppercase">{day}</span>
              {dayClosure && (
                <div className="mt-4 space-y-1">
                  <p className={`text-lg font-serif italic ${dayClosure.balance >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                    ${dayClosure.balance.toLocaleString()}
                  </p>
                  <p className="text-[8px] font-bold uppercase text-gray-400">Bal. Final</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};