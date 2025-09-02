
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Fade from 'embla-carousel-fade';
import { SupportButton } from '@/components/SupportButton';

export default function NosotrosPage() {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );
  const fadePlugin = React.useRef(
    Fade()
  );


  const teamImages = [
    "https://i.postimg.cc/DZB9QZNs/486390744-682232147646389-5623095431711685766-n.webp",
    "https://i.postimg.cc/8CBQ5wBZ/486325855-684608830742054-2479437861917541738-n-1.jpg",
    "https://i.postimg.cc/268J5Y55/487079835-684551517414452-3203492538834740030-n.jpg",
    "https://i.postimg.cc/nLtfpN7s/493106055-725259676676969-729401598865499676-n.webp"
  ];

  React.useEffect(() => {
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuButton && mobileMenu) {
      const toggleMenu = () => {
        mobileMenu.classList.toggle('hidden');
      };
      menuButton.addEventListener('click', toggleMenu);
      
      const links = Array.from(document.querySelectorAll('#mobile-menu a'));
      const closeMenu = () => mobileMenu.classList.add('hidden');
      
      links.forEach(link => {
        if (!link.id.includes('support-button')) {
            link.addEventListener('click', closeMenu);
        }
      });
      
      return () => {
        menuButton.removeEventListener('click', toggleMenu);
        links.forEach(link => {
            link.removeEventListener('click', closeMenu);
        });
      }
    }

  }, []);


  return (
    <>
      <div className="bg-secondary text-foreground">
        <nav className="bg-white/80 shadow-md fixed w-full z-50 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-3">
                    <Image src="https://i.postimg.cc/6qRNQd57/468963711-3994290450845859-6671631898219414239-n-removebg-preview.webp" alt="Copiermaster C&G Soluciones Digitales S.A Logo" width={128} height={128} className="h-24 md:h-32 w-auto" />
                </Link>
                
                <div className="md:hidden">
                    <button id="menu-button" className="text-foreground focus:outline-none">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-4 6h4"></path>
                        </svg>
                    </button>
                </div>

                <div className="hidden md:flex space-x-8 items-center">
                    <Link href="/" className="text-foreground hover:text-primary font-semibold transition duration-300">Inicio</Link>
                    <Link href="/soluciones" className="text-foreground hover:text-primary font-semibold transition duration-300">Soluciones</Link>
                    <Link href="/aima" className="text-foreground hover:text-primary font-semibold transition duration-300">Boot &amp; Landing</Link>
                    <Link href="/nosotros" className="text-primary font-semibold transition duration-300">Nosotros</Link>
                    <Link href="/contacto" className="text-foreground hover:text-primary font-semibold transition duration-300">Contacto</Link>
                </div>
            </div>

            <div id="mobile-menu" className="hidden md:hidden bg-white/95">
                <Link href="/" className="block py-3 px-6 text-foreground hover:bg-gray-100">Inicio</Link>
                <Link href="/soluciones" className="block py-3 px-6 text-foreground hover:bg-gray-100">Soluciones</Link>
                <Link href="/aima" className="block py-3 px-6 text-foreground hover:bg-gray-100">Boot &amp; Landing</Link>
                <Link href="/nosotros" className="block py-3 px-6 text-primary font-semibold">Nosotros</Link>
                <Link href="/contacto" className="block py-3 px-6 text-foreground hover:bg-gray-100">Contacto</Link>
            </div>
        </nav>

        <main className="pt-32 md:pt-40">
          <section className="py-20 bg-background">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2">
                        <h1 className="text-5xl font-extrabold text-foreground mb-6">16 Años Conectando Empresas con el Futuro</h1>
                        <p className="text-lg text-muted-foreground mb-4">Desde 2008, en Copiermaster C&G hemos sido pioneros en la integración de soluciones tecnológicas que impulsan la productividad y eficiencia de las empresas en Ecuador.</p>
                        <p className="text-lg text-muted-foreground mb-8">Nacimos con la visión de ser más que un proveedor: somos un socio estratégico que acompaña a nuestros clientes en cada paso de su transformación digital.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-secondary p-6 rounded-lg shadow-sm border-l-4 border-primary">
                                <h3 className="text-xl font-bold text-primary mb-2">Nuestra Misión</h3>
                                <p className="text-muted-foreground">Facilitar la adopción tecnológica de nuestros clientes a través de soluciones innovadoras y un servicio de excelencia que garantice su éxito operativo.</p>
                            </div>
                            <div className="bg-secondary p-6 rounded-lg shadow-sm border-l-4 border-primary">
                                <h3 className="text-xl font-bold text-primary mb-2">Nuestra Visión</h3>
                                <p className="text-muted-foreground">Ser el referente en soluciones de automatización y gestión documental en Ecuador, liderando el camino hacia oficinas más inteligentes y sostenibles.</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <Carousel 
                          className="w-full"
                          plugins={[autoplayPlugin.current, fadePlugin.current]}
                          opts={{
                            loop: true,
                          }}
                        >
                          <CarouselContent>
                            {teamImages.map((src, index) => (
                              <CarouselItem key={index}>
                                <div className="p-1">
                                  <Card className="bg-transparent border-gray-200">
                                    <CardContent className="flex aspect-square items-center justify-center p-0 overflow-hidden rounded-lg">
                                      <Image src={src} alt={`Equipo de Copiermaster ${index + 1}`} width={600} height={600} className="w-full h-full object-cover"/>
                                    </CardContent>
                                  </Card>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="ml-12 text-foreground bg-white/50 hover:bg-primary hover:text-white" />
                          <CarouselNext className="mr-12 text-foreground bg-white/50 hover:bg-primary hover:text-white" />
                        </Carousel>
                    </div>
                </div>
            </div>
          </section>
        </main>
        
        <footer className="bg-gray-800 text-white py-12">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8">
                <div>
                    <Image src="https://i.postimg.cc/6qRNQd57/468963711-3994290450845859-6671631898219414239-n-removebg-preview.webp" alt="Copiermaster C&G Logo" width={144} height={144} className="h-36 w-auto mb-4" />
                </div>
                <div>
                    <h4 className="text-lg font-bold mb-4">Marcas</h4>
                    <ul className="space-y-2">
                        <li><a href="/#marcas" className="text-gray-400 hover:text-primary transition duration-300">Nuestras Marcas</a></li>
                        <li><Link href="/soluciones" className="text-gray-400 hover:text-primary transition duration-300">Equipos</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-bold mb-4">Boot &amp; Landing</h4>
                    <ul className="space-y-2">
                        <li><Link href="/aima" className="text-gray-400 hover:text-primary transition duration-300">Inteligencia Artificial</Link></li>
                        <li><Link href="/soluciones" className="text-gray-400 hover:text-primary transition duration-300">Soluciones</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-bold mb-4">Legal</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Política de Calidad</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Política de Privacidad</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Términos y Condiciones</a></li>
                        <li><Link href="/login" className="text-gray-400 hover:text-primary transition duration-300">Soporte</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-bold mb-4">Contacto</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li>Av. Unidad Nacional y Argentina (Shushufindi - Ecuador)</li>
                        <li>0985380150</li>
                        <li>info@copiermastercyg.com.ec</li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-6 mt-10 border-t border-gray-700 pt-8 text-center">
                <p className="text-gray-500 text-sm">&copy; 2024 Copiermaster C&G Soluciones Digitales S.A. Todos los derechos reservados.</p>
            </div>
        </footer>
        <SupportButton />
      </div>
    </>
  );
}

    
