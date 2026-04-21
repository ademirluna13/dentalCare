import React from 'react';

const treatments = [
  { 
    id: 1, title: "Ortodoncia", size: "lg", icon: "🦷",
    desc: "Alineadores invisibles y brackets de alta precisión para una mordida perfectamente equilibrada.",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2000" 
  },
  { 
    id: 2, title: "Blanqueamiento", size: "sm", icon: "✨",
    desc: "Tratamientos aclaradores de grado profesional para una sonrisa radiante y segura.",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1000" 
  },
  { 
    id: 3, title: "Implantes", size: "sm", icon: "💎",
    desc: "Restauraciones permanentes y naturales que devuelven la funcionalidad total.",
    image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1000" 
  },
  { 
    id: 4, title: "Odontopediatría", size: "md", icon: "🧸",
    desc: "Cuidado dental gentil para establecer una vida de salud oral en los más pequeños.",
    image: "https://images.unsplash.com/photo-1551076805-e1869023742a?q=80&w=2000" 
  },
  { 
    id: 5, title: "Cirugía", size: "sm", icon: "🩺",
    desc: "Procedimientos avanzados con un enfoque en la recuperación rápida y el confort.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000" 
  },
  { 
    id: 6, title: "Endodoncia", size: "sm", icon: "🔍",
    desc: "Tratamientos de conducto precisos utilizando la última micro-tecnología.",
    image: "https://images.unsplash.com/photo-1629909608135-ca29e0026f51?q=80&w=1000" 
  },
  { 
    id: 7, title: "Periodoncia", size: "md", icon: "🛡️",
    desc: "Cuidado especializado de las encías y la estabilidad estructural de tu sonrisa.",
    image: "https://images.unsplash.com/photo-1445527815219-ecbfec67492e?q=80&w=2000" 
  }
];

export const Treatments = () => {
  return (
    <section id="services" className="py-32 px-8 md:px-20 bg-brand-neutral overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="mb-20 space-y-4 animate-fade-in">
          <h2 className="text-5xl md:text-[5rem] font-serif text-brand-dark italic leading-none tracking-tighter">
            Tratamientos <span className="not-italic font-light text-brand-primary/80">Seleccionados</span>
          </h2>
          <div className="flex items-center gap-4">
             <div className="h-[1px] w-12 bg-brand-primary"></div>
             <p className="text-brand-dark/50 font-sans font-bold text-[11px] tracking-[0.4em] uppercase">
               Excelencia clínica en cada detalle
             </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[360px] gap-8">
          {treatments.map((t) => (
            <div 
              key={t.id}
              className={`
                relative rounded-[3.5rem] overflow-hidden group cursor-pointer transition-all duration-700
                ${t.size === 'lg' ? 'md:col-span-2 md:row-span-2' : ''}
                ${t.size === 'md' ? 'md:col-span-2 md:row-span-1' : ''}
                ${t.size === 'sm' ? 'md:col-span-1 md:row-span-1' : ''}
                hover:shadow-2xl border border-brand-primary/5
              `}
            >
              {/* --- IMAGEN: Estado Normal --- */}
              <div className="absolute inset-0">
                <img 
                  src={t.image} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={t.title} 
                />
              </div>

              {/* Gradiente permanente para legibilidad (Sombra en la base) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 z-10" />

              {/* Capa Color Principal en Hover */}
              <div className="absolute inset-0 bg-brand-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-20" />

              {/* --- CONTENIDO --- */}
              <div className="relative h-full p-10 flex flex-col justify-between z-30">
                
                {/* Icono */}
                <div className="w-14 h-14 rounded-[1.5rem] bg-white/90 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg transition-transform duration-500 group-hover:scale-110">
                  {t.icon}
                </div>

                {/* Textos */}
                <div className="transform transition-all duration-700 translate-y-6 group-hover:translate-y-0">
                  {/* Título en BLANCO con sombra para que siempre se vea */}
                  <h3 className={`font-serif italic leading-tight text-white drop-shadow-md transition-all duration-500 
                    ${t.size === 'lg' ? 'text-5xl md:text-6xl' : 'text-3xl'} 
                    mb-3 tracking-tighter`}
                  >
                    {t.title}
                  </h3>

                  {/* Revelado de Info */}
                  <div className="max-h-0 opacity-0 group-hover:max-h-48 group-hover:opacity-100 transition-all duration-700 ease-in-out overflow-hidden">
                    <p className="text-white/90 font-sans text-sm font-light leading-relaxed mb-6 max-w-[95%]">
                      {t.desc}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-white">
                      <span>Explorar más</span>
                      <div className="h-[1px] w-6 bg-white group-hover:w-12 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Brillo de borde interno */}
              <div className="absolute inset-0 border-[1px] border-white/10 rounded-[3.5rem] pointer-events-none z-40" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};