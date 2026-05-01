import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../Shared/Sidebar';
import { supabase } from '../../../../lib/supabase';
import { 
  UserGroupIcon, CalendarDaysIcon, PencilSquareIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import Swal from 'sweetalert2';

export const AdminDashboard = () => {
  const [data, setData] = useState({
    adminName: 'Marlboro',
    patients: 0,
    appointments: 0,
    gross: 0,
    expenses: 0,
    net: 0,
    monthlyTarget: 20000,
    barData: [] as any[],
    areaData: [] as any[]
  });

  const COLORS = ['#4A3737', '#FCECEC'];

  const fetchRealData = async () => {
    try {
      // 1. IDENTIDAD
      const { data: { user } } = await supabase.auth.getUser();
      let name = 'Marlboro';
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (profile) name = profile.full_name;
      }

      // 2. META MENSUAL DINÁMICA
      const { data: settings } = await supabase
        .from('clinic_settings')
        .select('monthly_target')
        .eq('id', 1)
        .single();
      const targetReal = settings ? Number(settings.monthly_target) : 20000;

      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString();

      // 3. INGRESOS Y EGRESOS REALES
      const { data: allTrans } = await supabase.from('clinic_transactions')
        .select('amount, type, created_at')
        .gte('created_at', startOfYear);

      const monthlyStats = Array(12).fill(0).map((_, i) => ({ 
        name: new Date(0, i).toLocaleString('es', { month: 'short' }).toUpperCase(), 
        ingresos: 0, 
        egresos: 0 
      }));

      let currentGross = 0;
      let currentExp = 0;

      allTrans?.forEach(t => {
        const date = new Date(t.created_at);
        const month = date.getMonth();
        const amount = Number(t.amount);
        
        if (t.type === 'ingreso') {
          monthlyStats[month].ingresos += amount;
          if (month === today.getMonth()) currentGross += amount;
        }
        if (t.type === 'egreso') {
          monthlyStats[month].egresos += amount;
          if (month === today.getMonth()) currentExp += amount;
        }
      });

      const realBarData = monthlyStats.slice(0, today.getMonth() + 1);

      // 4. CITAS REALES
      const { data: monthApps } = await supabase.from('appointments')
        .select('appointment_date')
        .gte('appointment_date', firstDayOfMonth);

      const appCounts: Record<string, number> = {};
      monthApps?.forEach(a => {
        const day = new Date(a.appointment_date).getDate().toString();
        appCounts[day] = (appCounts[day] || 0) + 1;
      });

      const realAreaData = Object.keys(appCounts)
        .sort((a, b) => Number(a) - Number(b))
        .map(day => ({ name: `${day} Abr`, consultas: appCounts[day] }));

      // 5. CENSOS
      const { count: p } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient');
      const { count: apps } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('appointment_date', firstDayOfMonth);

      setData({ 
        adminName: name,
        gross: currentGross, 
        expenses: currentExp, 
        net: currentGross - currentExp, 
        monthlyTarget: targetReal,
        patients: p || 0, 
        appointments: apps || 0,
        barData: realBarData,
        areaData: realAreaData.length > 0 ? realAreaData : [{ name: 'Sin datos', consultas: 0 }]
      });
    } catch (err) {
      console.error("Falla en el búnker:", err);
    }
  };

  useEffect(() => { fetchRealData(); }, []);

  // --- LÓGICA DE SWEETALERT BLINDADA ---
  const handleUpdateTarget = async () => {
    const { value: newTarget } = await Swal.fire({
      title: '<h2 style="font-family: serif; font-style: italic; color: #4A3737; margin:0;">Ajustar Meta</h2>',
      html: '<p style="font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">Objetivo Mensual</p>',
      input: 'number',
      inputValue: data.monthlyTarget,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4A3737',
      cancelButtonColor: '#e5e7eb',
      background: '#ffffff',
      customClass: {
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3 text-gray-500',
        input: 'rounded-xl bg-[#F8F7F4] border-none text-center font-bold text-2xl text-[#4A3737] focus:ring-2 focus:ring-[#F4B6B6]',
        popup: 'rounded-[2rem] border border-[#F4B6B6]/20 shadow-2xl'
      },
      inputValidator: (value) => {
        if (!value || isNaN(Number(value))) {
          return '¡Necesitas poner un número válido, jefe!';
        }
      }
    });

    if (newTarget) {
      const numericTarget = Number(newTarget);
      try {
        // Validación estricta con Supabase
        const { error } = await supabase
          .from('clinic_settings')
          .update({ monthly_target: numericTarget })
          .eq('id', 1);
          
        // Si Supabase rebota el cambio, lanzamos el error para atraparlo en el catch
        if (error) throw error; 
          
        // Si llega aquí, es porque YA ESTÁ EN LA BASE DE DATOS
        setData(prev => ({ ...prev, monthlyTarget: numericTarget }));
        
        Swal.fire({
          title: '¡Meta Actualizada!',
          text: `El nuevo objetivo es $${numericTarget.toLocaleString()}`,
          icon: 'success',
          confirmButtonColor: '#629483',
          customClass: { popup: 'rounded-[2rem]' }
        });
      } catch (error: any) {
        console.error("Falla real al actualizar en Supabase:", error);
        Swal.fire('Error de Base de Datos', `Revisa el RLS en Supabase: ${error.message}`, 'error');
      }
    }
  };

  // Cálculos Dona
  const targetPercentage = Math.min((data.gross / data.monthlyTarget) * 100, 100).toFixed(1);
  const pieData = [
    { name: 'Logrado', value: data.gross },
    { name: 'Faltante', value: Math.max(data.monthlyTarget - data.gross, 0) }
  ];

  return (
    <div className="flex h-screen bg-[#F8F7F4] text-[#4A3737]">
      
      <Sidebar />
      
      <div className="flex-1 lg:pl-72 flex flex-col h-screen overflow-hidden">
        
        <main className="flex-1 overflow-y-auto p-8 md:p-12 pt-16">
          
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Performance Analytics</p>
            <h2 className="text-5xl lg:text-6xl font-serif italic tracking-tighter">
              Panel <span className="text-[#F4B6B6]">Analítico</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="xl:col-span-2 space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <KpiCard title="Comunidad Luminous" value={data.patients} trend="Total Acumulado" icon={UserGroupIcon} />
                <KpiCard title="Citas del Mes" value={data.appointments} trend="Tráfico actual" icon={CalendarDaysIcon} />
              </div>

              {/* GRÁFICO BARRAS */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F4B6B6]/20">
                <h3 className="text-2xl font-serif italic text-[#4A3737] mb-8">Flujo de Caja Anual</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4A3737', fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4A3737' }} />
                      <Tooltip cursor={{ fill: '#F8F7F4' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="ingresos" fill="#4A3737" radius={[6, 6, 0, 0]} barSize={16} />
                      <Bar dataKey="egresos" fill="#F4B6B6" radius={[6, 6, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: META MENSUAL */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#F4B6B6]/20 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-serif italic text-[#4A3737]">Meta Mensual</h3>
                  <button 
                    onClick={handleUpdateTarget}
                    className="p-2 bg-[#F8F7F4] rounded-xl hover:bg-[#F4B6B6] hover:text-white text-gray-400 transition-all duration-300 shadow-sm"
                    title="Editar meta"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">Objetivo de ingresos</p>
                
                <div className="h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={80} outerRadius={100} paddingAngle={2} dataKey="value" startAngle={180} endAngle={0} stroke="none">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                    <span className="text-4xl font-serif italic text-[#4A3737]">{targetPercentage}%</span>
                  </div>
                </div>

                <p className="text-sm text-center text-[#4A3737] mt-4 px-4 font-medium">
                  Has capturado <strong className="font-bold">${data.gross.toLocaleString()}</strong> este mes. La meta es de ${data.monthlyTarget.toLocaleString()}.
                </p>
              </div>

              {/* FOOTER DONUT */}
              <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-[#F4B6B6]/20 text-center">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Target</p>
                  <p className="text-lg font-serif italic text-[#4A3737]">${(data.monthlyTarget / 1000).toFixed(1)}K</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Logrado</p>
                  <p className="text-lg font-serif italic text-[#629483]">${(data.gross / 1000).toFixed(1)}K</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Egresos</p>
                  <p className="text-lg font-serif italic text-[#F4B6B6]">${(data.expenses / 1000).toFixed(1)}K</p>
                </div>
              </div>
            </div>

          </div>

          {/* GRÁFICO DE ÁREA */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F4B6B6]/20">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-serif italic text-[#4A3737]">Estadísticas de Tráfico</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Citas agendadas por día</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#F8F7F4] text-[#4A3737] px-4 py-2 rounded-full">
                Mes Actual
              </span>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A3737" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4A3737" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4A3737', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4A3737' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="consultas" stroke="#4A3737" strokeWidth={4} fillOpacity={1} fill="url(#colorConsultas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, trend, icon: Icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F4B6B6]/20 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
      <p className="text-5xl font-serif italic text-[#4A3737] mb-2">{value.toLocaleString()}</p>
      <p className="text-[9px] font-bold text-[#629483] uppercase tracking-wider">{trend}</p>
    </div>
    <div className="w-16 h-16 rounded-2xl bg-[#F8F7F4] flex items-center justify-center group-hover:bg-[#4A3737] group-hover:text-white transition-colors duration-500">
      <Icon className="w-8 h-8 text-[#F4B6B6] group-hover:text-white transition-colors" />
    </div>
  </div>
);