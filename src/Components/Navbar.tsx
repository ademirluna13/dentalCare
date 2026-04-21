import React, { useState, useEffect } from 'react';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-[100] transition-all duration-700 px-8 md:px-20 py-6
      ${isScrolled 
        ? 'bg-brand-primary/90 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(244,182,182,0.5)] py-4' 
        : 'bg-brand-primary/10 backdrop-blur-sm'}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO: Ahora en blanco o café oscuro dependiendo del fondo */}
        <div className="group cursor-pointer">
          <h1 className={`text-2xl md:text-3xl font-serif italic tracking-tighter transition-colors duration-500
            ${isScrolled ? 'text-white' : 'text-brand-dark'}`}>
            Luminous <span className={`${isScrolled ? 'text-white/70' : 'text-brand-primary'} font-light not-italic`}>Clinic</span>
          </h1>
          <div className={`h-[1px] w-0 transition-all duration-700 ${isScrolled ? 'bg-white' : 'bg-brand-primary'} group-hover:w-full`}></div>
        </div>

        {/* NAVEGACIÓN: Links que cambian de color con el scroll */}
        <div className="hidden md:flex gap-12 items-center">
          {['Servicios', 'Expertise', 'Galeria', 'Reseñas'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`relative text-[10px] font-sans font-bold uppercase tracking-[0.3em] transition-all duration-500 group
                ${isScrolled ? 'text-white/80 hover:text-white' : 'text-brand-dark/60 hover:text-brand-dark'}`}
            >
              {item}
              <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all
                ${isScrolled ? 'bg-white' : 'bg-brand-primary'}`}></span>
            </a>
          ))}
        </div>

        {/* ACCIÓN: Botón que resalta sobre el rosa */}
        <div className="flex items-center gap-8">
          <button className={`hidden sm:block px-8 py-3 text-[10px] font-sans font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-500 shadow-lg
            ${isScrolled 
              ? 'bg-white text-brand-primary hover:bg-brand-dark hover:text-white shadow-brand-dark/20' 
              : 'bg-brand-dark text-white hover:bg-brand-primary shadow-brand-dark/10'}`}>
            Agendar Consulta
          </button>

          {/* Menú Móvil */}
          <button className="md:hidden flex flex-col gap-1.5 group">
            <span className={`w-6 h-[2px] rounded-full transition-all ${isScrolled ? 'bg-white' : 'bg-brand-dark'}`}></span>
            <span className={`w-4 h-[2px] rounded-full transition-all ${isScrolled ? 'bg-white' : 'bg-brand-dark'}`}></span>
            <span className={`w-6 h-[2px] rounded-full transition-all ${isScrolled ? 'bg-white' : 'bg-brand-dark'}`}></span>
          </button>
        </div>
        
      </div>

      {/* Línea de brillo sutil inferior */}
      <div className={`absolute bottom-0 left-0 w-full h-[1px] transition-opacity duration-500 ${isScrolled ? 'bg-white/20' : 'bg-brand-primary/10'}`}></div>
    </nav>
  );
};