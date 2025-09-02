
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Building, Clock } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { Card, CardContent } from '@/components/ui/card';
import { SupportButton } from '@/components/SupportButton';

export default function ContactoPage() {

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

  const branchInfo = [
    {
        name: "Matriz Shushufindi",
        address: "Av. Unidad Nacional y Argentina",
        phone: "0985 380 150"
    },
    {
        name: "Sucursal Quito",
        address: "Sur, cerca a la Plataforma Gubernamental Sur",
        phone: "0985 380 150"
    },
    {
        name: "Sucursal Santo Domingo",
        address: "Cooperativa Las Guaduas",
        phone: "0985 380 150"
    },
    {
        name: "Sucursal Ambato",
        address: "Junto al Gobierno Provincial",
        phone: "0985 380 150"
    }
  ]

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
                    <Link href="/nosotros" className="text-foreground hover:text-primary font-semibold transition duration-300">Nosotros</Link>
                    <Link href="/contacto" className="text-primary font-semibold transition duration-300">Contacto</Link>
                </div>
            </div>

            <div id="mobile-menu" className="hidden md:hidden bg-white/95">
                <Link href="/" className="block py-3 px-6 text-foreground hover:bg-gray-100">Inicio</Link>
                <Link href="/soluciones" className="block py-3 px-6 text-foreground hover:bg-gray-100">Soluciones</Link>
                <Link href="/aima" className="block py-3 px-6 text-foreground hover:bg-gray-100">Boot &amp; Landing</Link>
                <Link href="/nosotros" className="block py-3 px-6 text-foreground hover:bg-gray-100">Nosotros</Link>
                <Link href="/contacto" className="block py-3 px-6 text-primary font-semibold">Contacto</Link>
            </div>
        </nav>

        <main className="pt-32 md:pt-40">
          <section className="py-20 bg-secondary">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-foreground mb-4">Hablemos</h1>
                    <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">Estamos aquí para ayudarte. Contáctanos para cotizaciones, soporte o cualquier consulta que tengas.</p>
                </div>
                
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-8">Nuestras Sucursales</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {branchInfo.map((branch, index) => (
                                <div key={index} className="bg-card p-6 rounded-lg shadow-lg flex flex-col border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Building className="h-6 w-6 text-primary" />
                                        <h3 className="text-xl font-bold text-foreground">{branch.name}</h3>
                                    </div>
                                    <div className="space-y-3 text-muted-foreground flex-grow">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <span>{branch.address}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-primary" />
                                            <a href={`tel:${branch.phone.replace(/\s/g, '')}`} className="hover:text-primary">{branch.phone}</a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <Card className="mt-8 bg-card p-6 rounded-lg shadow-lg flex items-center gap-4 border">
                            <Clock className="h-8 w-8 text-primary" />
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Horario de Atención</h3>
                                <p className="text-muted-foreground">Lunes a Viernes: 8:00 AM – 5:00 PM</p>
                                <p className="text-muted-foreground">Sábados y Domingos: Cerrado</p>
                            </div>
                        </Card>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-8">O Envíanos un Mensaje</h2>
                         <Card className="shadow-lg bg-card border">
                            <CardContent className="p-6">
                                <ContactForm />
                            </CardContent>
                        </Card>
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

    
