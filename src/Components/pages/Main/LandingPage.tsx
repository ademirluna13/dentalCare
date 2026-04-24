import React from 'react';
import { Navbar } from '../../Public/Navbar';
import  HeroSection  from '../../Public/HeroSection';
import { Technology } from '../../Public/Technology';
import { Treatments } from '../../Public/Treatments';
import { Atmosphere } from '../../Public/Atmospere';
import { BeforeAfterSlider } from '../../Public/BeforeAfterSlider';
import { Artisans } from '../../Public//Artisans';
import { Experience } from '../../Public/Experience';
import { Concierge } from '../../Public/Concierge';
import { Reviews } from '../../Public/Reviews';
import { Footer } from '../../Public/Footer';

export const LandingPage = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Technology />
      <Treatments />
      <Atmosphere />
      <BeforeAfterSlider />
      <Artisans />
      <Experience />
      <Concierge />
      <Reviews />
      <Footer />
    </>
  );
};