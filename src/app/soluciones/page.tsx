
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Lock, Sparkles, Share2, Printer, Eye } from 'lucide-react';
import { ContactModal } from '@/components/ContactModal';
import { SupportButton } from '@/components/SupportButton';

export default function SolucionesPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

   React.useEffect(() => {
    let player: any;
    const tag = document.createElement('script');
    if (!(window as any).YT) {
        tag.src = "https://www.youtube.com/iframe_api";
        window.document.body.appendChild(tag);
    }

    const onYouTubeIframeAPIReady = () => {
        const playerElement = document.getElementById('hero-video-player');
        if (playerElement) {
             try {
                player = new (window as any).YT.Player('hero-video-player', {
                    videoId: '4nKF-Rsq8tU',
                    playerVars: {
                        'autoplay': 1, 'controls': 0, 'mute': 1, 'loop': 1, 
                        'playlist': '4nKF-Rsq8tU', 'start': 0
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
            } catch (e) {
                console.error("YouTube Player Error:", e);
            }
        }
    }
    
    const onPlayerReady = (event: any) => {
        event.target.playVideo();
    }

    const onPlayerStateChange = (event: any) => {
        if (event.data === (window as any).YT.PlayerState.ENDED) {
            player.seekTo(0);
        }
    }

    if ((window as any).YT && (window as any).YT.Player) {
        onYouTubeIframeAPIReady();
    } else {
        (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
    
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
        if (player && typeof player.destroy === 'function') {
            player.destroy();
        }
        (window as any).onYouTubeIframeAPIReady = null;
      }
    }
  }, []);

  const openSupportModal = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsModalOpen(true);
  };

  return (
    <>
       <style jsx global>{`
            #hero-video-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 0;
            }
            #hero-video-player {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 120%; /* Scale up to hide controls */
                height: 120%; /* Scale up to hide controls */
                transform: translateX(-50%) translateY(-50%) scale(1.5); /* Zoom in to hide YouTube logo */
            }
        `}</style>
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
                    <Link href="/soluciones" className="text-primary font-semibold transition duration-300">Soluciones</Link>
                    <Link href="/aima" className="text-foreground hover:text-primary font-semibold transition duration-300">Boot &amp; Landing</Link>
                    <Link href="/nosotros" className="text-foreground hover:text-primary font-semibold transition duration-300">Nosotros</Link>
                    <Link href="/contacto" className="text-foreground hover:text-primary font-semibold transition duration-300">Contacto</Link>
                </div>
            </div>

            <div id="mobile-menu" className="hidden md:hidden bg-white/95">
                <Link href="/" className="block py-3 px-6 text-foreground hover:bg-gray-100">Inicio</Link>
                <Link href="/soluciones" className="block py-3 px-6 text-primary font-semibold">Soluciones</Link>
                <Link href="/aima" className="block py-3 px-6 text-foreground hover:bg-gray-100">Boot &amp; Landing</Link>
                <Link href="/nosotros" className="block py-3 px-6 text-foreground hover:bg-gray-100">Nosotros</Link>
                <Link href="/contacto" className="block py-3 px-6 text-foreground hover:bg-gray-100">Contacto</Link>
            </div>
        </nav>

        <main className="pt-32 md:pt-32">
          <section className="relative overflow-hidden bg-gray-900 text-white h-[70vh] flex items-center justify-center">
             <div id="hero-video-container">
                <div id="hero-video-player"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
            <div className="container mx-auto px-6 relative z-10">
              <div className="text-left max-w-2xl">
                  <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                    Soluciones de Impresión de Producción
                  </h1>
                  <p className="mt-4 text-lg text-gray-200">
                      Alcanza una velocidad, calidad y flexibilidad superiores con impresoras digitales avanzadas diseñadas para la impresión de alto volumen.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                       <button
                        onClick={openSupportModal}
                        className="bg-primary text-primary-foreground text-md font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-primary/90 transition duration-300 transform hover:scale-105 inline-block"
                      >
                          Empieza Ahora
                      </button>
                      <button
                        onClick={openSupportModal}
                        className="bg-transparent border border-white text-white text-md font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-white/10 transition duration-300 transform hover:scale-105 inline-block"
                      >
                          Más Información
                      </button>
                  </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-secondary">
              <div className="container mx-auto px-6">
                  <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold text-foreground">¿Cómo Podemos Ayudarte?</h2>
                      <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">Desde la optimización de tu flota de impresión hasta la transformación digital completa de tus procesos.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                      <div className="bg-white p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-2 duration-300 border">
                          <Printer className="h-12 w-12 text-primary mb-5"/>
                          <h3 className="text-2xl font-bold text-foreground mb-3">Servicio de Impresión Gestionado</h3>
                          <p className="text-muted-foreground">Optimiza tu entorno de impresión con un servicio todo incluido: equipos de última generación, consumibles, mantenimiento proactivo y soporte técnico, todo bajo un costo predecible.</p>
                      </div>

                      <div className="bg-white p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-2 duration-300 border">
                          <Share2 className="h-12 w-12 text-primary mb-5"/>
                          <h3 className="text-2xl font-bold text-foreground mb-3">Comunicaciones Gráficas</h3>
                          <p className="text-muted-foreground">Desde la pre-impresión hasta el acabado final, gestionamos tus necesidades de comunicación visual con soluciones de alta calidad para producción, publicidad y artes gráficas.</p>
                      </div>

                      <div className="bg-white p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-2 duration-300 border">
                          <Sparkles className="h-12 w-12 text-primary mb-5"/>
                          <h3 className="text-2xl font-bold text-foreground mb-3">Transformación Digital</h3>
                          <p className="text-muted-foreground">Impulsa la digitalización de tus procesos. Automatizamos flujos de trabajo y gestionamos tus documentos para convertir tus archivos en activos digitales seguros, accesibles y fáciles de manejar.</p>
                      </div>

                      <div className="bg-white p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-2 duration-300 border">
                          <Eye className="h-12 w-12 text-primary mb-5"/>
                          <h3 className="text-2xl font-bold text-foreground mb-3">Visual Comunication</h3>
                          <p className="text-muted-foreground">Mejora la colaboración con nuestras soluciones audiovisuales: proyectores, pantallas interactivas y sistemas de videoconferencia para salas de reuniones modernas y eficientes.</p>
                      </div>

                      <div className="bg-white p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-2 duration-300 border">
                          <Lock className="h-12 w-12 text-primary mb-5"/>
                          <h3 className="text-2xl font-bold text-foreground mb-3">Impresión Segura</h3>
                          <p className="text-muted-foreground">Protege tu información confidencial. Implementamos soluciones de autenticación, control de acceso y seguimiento para garantizar que solo el personal autorizado imprima documentos sensibles.</p>
                      </div>

                      <div className="bg-white p-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-2 duration-300 border">
                          <Leaf className="h-12 w-12 text-primary mb-5"/>
                          <h3 className="text-2xl font-bold text-foreground mb-3">Sostenibilidad</h3>
                          <p className="text-muted-foreground">Contribuye al medio ambiente mientras ahorras. Ofrecemos equipos de bajo consumo energético y promovemos políticas de impresión inteligente para reducir tu huella de carbono.</p>
                      </div>
                  </div>
              </div>
          </section>

          <section className="py-20 bg-primary/10">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">¿Listo para transformar tu negocio?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Hablemos sobre tus necesidades específicas y diseñemos juntos un plan que impulse tu productividad.</p>
              <div className="mt-8">
                <button
                  onClick={openSupportModal}
                  className="bg-primary text-primary-foreground text-lg font-semibold px-10 py-4 rounded-full shadow-lg hover:bg-primary/90 transition duration-300 transform hover:scale-105 inline-block"
                >
                    Solicita una Consultoría
                </button>
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
      <ContactModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
