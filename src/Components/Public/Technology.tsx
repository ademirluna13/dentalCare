
const dentistImageUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000";

const MetricCard = ({ number, label, icon }: { number: string; label: string; icon: string }) => (
  <div className="flex-1 bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-white flex items-start gap-6 shadow-[0_20px_40px_-15px_rgba(244,182,182,0.2)] hover:shadow-[0_30px_60px_-10px_rgba(244,182,182,0.3)] hover:-translate-y-2 transition-all duration-700 group">
    <div className="w-16 h-16 bg-brand-secondary rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-5xl font-serif text-brand-primary leading-none mb-2 tracking-tighter">
        {number}
      </h4>
      <p className="text-[10px] font-sans text-brand-dark/50 uppercase tracking-[0.3em] font-bold leading-tight">
        {label}
      </p>
    </div>
  </div>
);

export const Technology = () => {
  return (
    <section className="py-32 px-8 md:px-20 bg-brand-neutral overflow-hidden relative">
      {/* Decoración de fondo sutil */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-primary/5 skew-x-12 translate-x-20 -z-0" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-20 items-center relative z-10">
        
        {/* --- COLUMNA 1: COMPOSICIÓN VISUAL --- */}
        <div className="relative">
          {/* El Arco de Imagen con Sombra Teñida */}
          <div className="relative group rounded-t-full overflow-hidden aspect-[3/4] shadow-[0_40px_100px_-20px_rgba(74,55,55,0.2)] border-[12px] border-white">
            <img 
              src={dentistImageUrl}
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-105 contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
              alt="Innovación Clínica"
            />
            {/* Tinte Rose Gold Senior */}
            <div className="absolute inset-0 bg-brand-primary/20 mix-blend-color group-hover:opacity-0 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 via-transparent to-transparent opacity-60" />
          </div>

          {/* Badge de "Excelencia" Flotante */}
          <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-brand-dark text-white p-6 rounded-3xl shadow-2xl rotate-3 hidden md:block">
            <p className="text-[9px] font-sans font-bold uppercase tracking-[0.3em] mb-1 opacity-70">Standard</p>
            <p className="text-xl font-serif italic italic">Clínica Boutique</p>
          </div>
        </div>

        {/* --- COLUMNA 2: CONTENIDO EDITORIAL --- */}
        <div className="space-y-12">
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-brand-primary" />
              <span className="text-[11px] font-sans font-bold text-brand-primary uppercase tracking-[0.4em]">
                Innovación Estética
              </span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-serif text-brand-dark leading-[0.9] tracking-tighter">
              Tecnología con <br />
              <span className="italic font-normal shimmer">Sentido Humano</span>
            </h2>

            <p className="font-sans font-light text-brand-dark/70 leading-relaxed text-xl max-w-xl">
              Creemos que la verdadera excelencia clínica es invisible. La mejor odontología pasa desapercibida; simplemente se traduce en una versión saludable y vibrante de ti.
            </p>
          </div>
          
          {/* Tarjetas de Métricas */}
          <div className="flex flex-col sm:flex-row gap-8">
            <MetricCard number="15+" label="Años de Maestría" icon="🩺" />
            <MetricCard number="5k+" label="Vidas Transformadas" icon="✨" />
          </div>

          <div className="space-y-6 font-sans font-light text-brand-dark/60 leading-relaxed text-lg max-w-2xl border-l-2 border-brand-primary/20 pl-8">
            <p>
              Nuestro enfoque utiliza los sistemas de imagen y materiales más avanzados del mundo, sin embargo, nuestra atmósfera está diseñada intencionalmente para sentirse como un santuario.
            </p>
            <p className="italic font-medium text-brand-dark/80">
              Priorizamos tu paz mental en cada paso del proceso.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};