import { useState, useRef, useEffect } from 'react';

export const BeforeAfterSlider = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // URLs TOTALMENTE DISTINTAS PARA QUE SE NOTE EL CAMBIO
  // El "Before" es una foto clínica, el "After" es el resultado estético.
  const before = "https://i.ibb.co/rYRDFjL/Captura-de-pantalla-2026-04-20-184215.png"; 
  const after = "https://i.ibb.co/Kjvc4TkZ/Captura-de-pantalla-2026-04-20-184215-copia.png";

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(position);
  };

  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);
  
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => isDragging && handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => isDragging && handleMove(e.touches[0].clientX);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  return (
    <section className="py-32 px-8 md:px-20 bg-brand-neutral">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-serif text-brand-dark italic leading-none">
            Visible <span className="not-italic font-light text-brand-primary">Transformation</span>
          </h2>
          <p className="text-brand-dark/50 font-sans text-[10px] uppercase tracking-[0.4em]">
            Drag the handle to reveal the Luminous effect.
          </p>
        </div>

        {/* El Contenedor Pro */}
        <div 
          ref={containerRef}
          className={`relative aspect-video md:aspect-[21/9] rounded-t-full overflow-hidden shadow-2xl border-4 border-white select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
        >
          {/* Capa de ABAJO: Resultado final a todo COLOR */}
          <img src={after} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="After" />
          
          {/* Capa de ARRIBA: El "Antes" en BLANCO Y NEGRO (con clipPath dinámico) */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            style={{ 
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              transition: isDragging ? 'none' : 'clip-path 0.5s ease-out' 
            }}
          >
            <img 
              src={before} 
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 pointer-events-none" 
              alt="Before" 
            />
          </div>

          {/* La BARRA Rose Gold */}
          <div 
            className="absolute top-0 bottom-0 z-30 flex items-center justify-center pointer-events-none"
            style={{ 
              left: `${sliderPos}%`,
              transition: isDragging ? 'none' : 'left 0.5s ease-out'
            }}
          >
            <div className={`w-[2px] h-full shadow-[0_0_15px_rgba(244,182,182,0.8)] ${isDragging ? 'bg-brand-primary' : 'bg-white/50'}`}></div>
            
            {/* El botón central */}
            <div className="absolute w-14 h-14 rounded-full bg-white border-2 border-brand-primary shadow-2xl flex items-center justify-center">
               <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse delay-75"></div>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center space-y-2">
          <h4 className="text-2xl font-serif italic text-brand-dark">Caso de estudio: Restauración completa</h4>
          <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-primary">Proceso: 4 Meses</p>
        </div>

      </div>
    </section>
  );
};