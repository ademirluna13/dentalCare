import React from 'react';

const doctors = [
  {
    id: 1,
    name: "Dr. Elena Rossi",
    role: "Lead Aesthetic Dentist",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1000",
  },
  {
    id: 2,
    name: "Dr. Marcus Chen",
    role: "Orthodontic Specialist",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000",
  },
  {
    id: 3,
    name: "Dr. Sarah Jenkins",
    role: "Pediatric Dentistry",
    image: "https://images.unsplash.com/photo-1559839734-2b71f1536750?q=80&w=1000",
  }
];

export const Artisans = () => {
  return (
    <section id="expertise" className="py-32 px-8 md:px-20 bg-brand-neutral">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Editorial */}
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-5xl md:text-7xl font-serif text-brand-dark italic leading-none">
            The <span className="not-italic font-light">Artisans</span>
          </h2>
          <div className="w-12 h-[1px] bg-brand-primary mx-auto"></div>
          <p className="text-brand-dark/50 font-sans text-[11px] font-bold uppercase tracking-[0.4em]">
            Expertos diseñando tu mejor versión
          </p>
        </div>

        {/* Grid de Doctores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          {doctors.map((doc) => (
            <div key={doc.id} className="group cursor-pointer">
              
              {/* Contenedor de Imagen (Arco Encendido) */}
              <div className="relative aspect-[4/5] rounded-t-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] mb-8 border border-brand-primary/10 transition-all duration-700 group-hover:shadow-[0_40px_80px_rgba(244,182,182,0.3)] group-hover:-translate-y-2">
                
                {/* IMAGEN: Siempre encendida, full color y brillo */}
                <img 
                  src={doc.image} 
                  alt={doc.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110"
                />

                {/* Efecto Mamalón: Destello de luz diagonal en hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-10" />
                
                {/* Overlay sutil inferior para legibilidad del borde */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Borde de Brillo en el Arco */}
                <div className="absolute inset-0 border-[0.5px] border-white/40 rounded-t-full pointer-events-none z-20" />
              </div>

              {/* Textos */}
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-serif text-brand-dark group-hover:text-brand-primary transition-colors duration-500">
                  {doc.name}
                </h3>
                <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-primary/60 group-hover:text-brand-primary transition-colors duration-500">
                  {doc.role}
                </p>
                
                {/* Botón que se revela */}
                <div className="pt-4 overflow-hidden">
                  <div className="transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                    <button className="text-[9px] font-sans font-bold uppercase tracking-widest text-brand-dark hover:text-brand-primary transition-colors">
                      Ver Perfil Completo —
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};