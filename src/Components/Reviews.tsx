import React from 'react';

const reviews = [
  { text: "La experiencia dental más serena que he tenido. Es una verdadera forma de arte.", author: "Lucía M." },
  { text: "Mi restauración superó toda expectativa. La tecnología Rose Gold es de otro nivel.", author: "Javier L." },
  { text: "En Luminous no solo diseñan sonrisas, diseñan confianza.", author: "Isabela R." },
  { text: "Un santuario de excelencia clínica. Mi lugar de confianza para siempre.", author: "Marcos V." },
  { text: "Finalmente una clínica que entiende la armonía estética y el lujo.", author: "Elena P." }
];

export const Reviews = () => {
  return (
    <section className="py-32 bg-brand-neutral overflow-hidden relative">
      {/* Máscara de degradado para un efecto infinito suave */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-brand-neutral via-transparent to-brand-neutral"></div>

      <div className="flex flex-col gap-16">
        {/* Encabezado Sutil */}
        <div className="text-center space-y-4 px-8">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.5em] text-brand-primary">
            Voces de nuestros pacientes
          </span>
          <h2 className="text-4xl font-serif text-brand-dark italic">Testimonios de Excelencia</h2>
        </div>

        {/* Contenedor de la Marquesina con Pausa al Hover */}
        <div className="flex w-fit animate-marquee whitespace-nowrap hover:[animation-play-state:paused] cursor-default">
          {[...reviews, ...reviews].map((rev, i) => (
            <div 
              key={i} 
              className="inline-block mx-12 md:mx-20 text-center group transition-transform duration-500 hover:scale-105"
            >
              {/* Estrellas de Calificación */}
              <div className="flex justify-center gap-1 mb-6 text-brand-primary/60 group-hover:text-brand-primary transition-colors">
                {"★★★★★".split("").map((s, i) => <span key={i} className="text-xs">{s}</span>)}
              </div>

              {/* Texto de la Reseña */}
              <p className="text-4xl md:text-6xl font-serif italic text-brand-dark opacity-30 group-hover:opacity-100 transition-all duration-700 leading-tight tracking-tighter">
                "{rev.text}"
              </p>

              {/* Autor con estilo Manrope */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-[1px] w-8 bg-brand-primary/30"></div>
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-brand-primary">
                  {rev.author}
                </span>
                <div className="h-[1px] w-8 bg-brand-primary/30"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decoración de fondo sutil */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
};