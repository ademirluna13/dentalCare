import { Artisans } from './Components/Artisans';
import { BeforeAfterSlider } from './Components/BeforeAfterSlider';
import { Concierge } from './Components/Concierge';
import { Footer } from './Components/Footer';
import HeroSection from './Components/HeroSection';
import { Navbar } from './Components/Navbar';
import { Reviews } from './Components/Reviews';
import { Technology } from './Components/Technology';
import { Treatments } from './Components/Treatments';

function App() {
  return (
    <div className="min-h-screen bg-brand-white">
      {/* El Navbar lo dejamos para después si quieres */}
      <main>
        <HeroSection />
        <Navbar />
        <Treatments/>
        <BeforeAfterSlider/>
        <Artisans/>
        <Technology/>
        <Reviews/>
        <Concierge/>
        <Footer/>
      </main>
    </div>
  );
}

export default App;