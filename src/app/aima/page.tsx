
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Briefcase, ShoppingCart, CalendarCheck, GraduationCap, PartyPopper, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import { SupportButton } from '@/components/SupportButton';

export default function AimaPage() {
  React.useEffect(() => {
    // Mobile menu toggle
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuButton && mobileMenu) {
      const toggleMenu = () => mobileMenu.classList.toggle('hidden');
      menuButton.addEventListener('click', toggleMenu);
      
      const links = mobileMenu.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
        });
      });

      return () => {
        menuButton.removeEventListener('click', toggleMenu);
        links.forEach(link => {
            link.removeEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
      }
    }
  }, []);

  React.useEffect(() => {
    // Particle animation script
    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();

        let particlesArray: Particle[];
        const config = {
            particleCount: 80,
            particleColor: 'rgba(255, 255, 255, 0.7)',
            particleSpeed: 0.5,
            lineDistance: 120,
            particleRadius: 2,
        };

        class Particle {
            x: number;
            y: number;
            directionX: number;
            directionY: number;
            size: number;
            color: string;

            constructor(x: number, y: number, dX: number, dY: number, s: number, c: string) {
                this.x = x;
                this.y = y;
                this.directionX = dX;
                this.directionY = dY;
                this.size = s;
                this.color = c;
            }

            draw() {
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx!.fillStyle = this.color;
                ctx!.fill();
            }

            update() {
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            for (let i = 0; i < config.particleCount; i++) {
                let s = (Math.random() * config.particleRadius) + 1;
                let x = (Math.random() * (canvas.width - s * 2)) + s * 2;
                let y = (Math.random() * (canvas.height - s * 2)) + s * 2;
                let dX = (Math.random() * config.particleSpeed * 2) - config.particleSpeed;
                let dY = (Math.random() * config.particleSpeed * 2) - config.particleSpeed;
                particlesArray.push(new Particle(x, y, dX, dY, s, config.particleColor));
            }
        }

        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = Math.sqrt(Math.pow(particlesArray[a].x - particlesArray[b].x, 2) + Math.pow(particlesArray[a].y - particlesArray[b].y, 2));
                    if (distance < config.lineDistance) {
                        opacityValue = 1 - (distance / config.lineDistance);
                        ctx!.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.25})`;
                        ctx!.lineWidth = 1;
                        ctx!.beginPath();
                        ctx!.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx!.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx!.stroke();
                    }
                }
            }
        }

        let animationFrameId: number;
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            ctx!.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }

        const handleResize = () => {
            resizeCanvas();
            init();
        };

        init();
        animate();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }
  }, []);

  const services = [
    {
      icon: Briefcase,
      title: "CRM Básico para PYMES",
      ideal: "Papelerías, ferreterías, imprentas, comercios locales.",
      includes: [
        "Registro de clientes y leads en una base de datos segura.",
        "Panel de seguimiento de estado (nuevo, en contacto, cerrado).",
        "Notificaciones automáticas de nuevos leads.",
        "Exportación de reportes en formatos estándar."
      ],
      benefit: "Control profesional de tus clientes sin invertir en costosos sistemas extranjeros.",
      color: "text-green-400",
    },
    {
      icon: ShoppingCart,
      title: "Pedidos Online con WhatsApp",
      ideal: "Restaurantes, heladerías, tiendas de ropa, ventas al por menor.",
      includes: [
          "Catálogo digital con tus productos, precios y fotos.",
          "Carrito de compras integrado.",
          "Botón para finalizar el pedido directamente en WhatsApp.",
          "Alojamiento web con dominio personalizado."
      ],
      benefit: "Comienza a vender en línea sin la complejidad de una tienda virtual completa.",
       color: "text-green-400",
    },
    {
      icon: CalendarCheck,
      title: "Reservas y Citas Inteligentes",
      ideal: "Clínicas, consultorios, spas, salones de belleza.",
      includes: [
          "Calendario de disponibilidad en tiempo real.",
          "Sistema de reservas online con confirmación automática.",
          "Notificaciones por correo para el cliente.",
          "Panel administrativo para gestionar todas las citas."
      ],
      benefit: "Optimiza tu agenda, evita errores y mejora la organización de tu negocio.",
      color: "text-green-400",
    },
    {
        icon: GraduationCap,
        title: "Portal Educativo Básico",
        ideal: "Escuelas, colegios, academias privadas.",
        includes: [
            "Registro digital de estudiantes y control de asistencia.",
            "Plataforma para publicar tareas y notas en línea.",
            "Listas de útiles escolares con opción de pedido.",
            "Acceso seguro para personal y estudiantes."
        ],
        benefit: "Moderniza la gestión de tu institución educativa de forma rápida y económica.",
        color: "text-green-400",
    },
    {
        icon: PartyPopper,
        title: "Gestión de Eventos y Turismo",
        ideal: "Salones de eventos, centros turísticos, hoteles.",
        includes: [
            "Sistema de reservas en línea con control de cupos.",
            "Panel de disponibilidad y registro de clientes.",
            "Gestión de pagos manuales con comprobantes.",
            "Reportes de ocupación para análisis."
        ],
        benefit: "Agiliza tu proceso de reservas y aumenta tus ventas con una herramienta moderna.",
        color: "text-green-400",
    }
  ];

  return (
    <>
    <canvas id="particle-canvas" className="fixed top-0 left-0 w-full h-full -z-10 bg-[#111815]"></canvas>

    <div className="font-sans text-gray-200">
       <div className="relative z-10">
      <nav className="bg-transparent shadow-md fixed w-full z-50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="https://i.postimg.cc/6qRNQd57/468963711-3994290450845859-6671631898219414239-n-removebg-preview.webp"
              alt="Copiermaster C&G Soluciones Digitales S.A Logo"
              width={128}
              height={128}
              className="h-24 md:h-32 w-auto"
            />
          </Link>

          <div className="md:hidden">
            <button id="menu-button" className="text-gray-200 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-4 6h4"></path>
              </svg>
            </button>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-gray-300 hover:text-primary font-semibold transition duration-300">
              Inicio
            </Link>
            <Link href="/soluciones" className="text-gray-300 hover:text-primary font-semibold transition duration-300">
              Soluciones
            </Link>
            <Link href="/aima" className="text-primary font-semibold transition duration-300">
              Boot &amp; Landing
            </Link>
            <Link href="/nosotros" className="text-gray-300 hover:text-primary font-semibold transition duration-300">
              Nosotros
            </Link>
            <Link href="/contacto" className="text-gray-300 hover:text-primary font-semibold transition duration-300">
              Contacto
            </Link>
          </div>
        </div>

        <div id="mobile-menu" className="hidden md:hidden bg-gray-900/95">
          <Link href="/" className="block py-3 px-6 text-gray-300 hover:bg-gray-800">
            Inicio
          </Link>
          <Link href="/soluciones" className="block py-3 px-6 text-gray-300 hover:bg-gray-800">
            Soluciones
          </Link>
          <Link href="/aima" className="block py-3 px-6 text-primary font-semibold">
            Boot &amp; Landing
          </Link>
          <Link href="/nosotros" className="block py-3 px-6 text-gray-300 hover:bg-gray-800">
            Nosotros
          </Link>
          <Link href="/contacto" className="block py-3 px-6 text-gray-300 hover:bg-gray-800">
            Contacto
          </Link>
        </div>
      </nav>

      <main className="pt-32 md:pt-40">
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Impulsa tu negocio con Agentes de Inteligencia Artificial y Landing Pages que venden
              </h2>
              <p className="text-lg text-gray-300 mb-12">
                En Boot & Landing combinamos tecnología inteligente con diseño web persuasivo para que tu empresa genere leads, ventas y resultados reales en Ecuador.
              </p>
              <p className="text-md text-gray-300 max-w-3xl mx-auto">
                 Creamos soluciones digitales prácticas y económicas para negocios locales: desde mini e-commerce, catálogos online, CRM simples, hasta agentes de IA que atienden clientes automáticamente por WhatsApp y web. <span className="font-semibold text-green-400">Tu negocio no necesita invertir en grandes plataformas; nosotros lo ponemos al alcance con tecnología en la nube.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 mt-16 max-w-4xl mx-auto">
              {services.map((service, index) => (
                <div key={index} className="bg-gray-900/50 backdrop-blur-md p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300 border border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`inline-block p-3 bg-gray-800 rounded-full`}>
                           <service.icon className={`h-8 w-8 ${service.color}`} />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-300">Ideal para:</h4>
                            <p className="text-gray-400">{service.ideal}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-300">Incluye:</h4>
                            <ul className="list-disc list-inside text-gray-400 space-y-1">
                                {service.includes.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-300">Beneficio:</h4>
                             <p className="text-gray-400">{service.benefit}</p>
                        </div>
                    </div>
                </div>
              ))}
            </div>
            
            <div className="max-w-4xl mx-auto mt-20 bg-gray-900/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700">
                <h3 className="text-2xl font-bold text-center text-white mb-6">Beneficios Principales</h3>
                <ul className="space-y-4">
                    <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-300">Soluciones rápidas y listas para usar.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-300">100% en la nube (seguridad y escalabilidad).</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-300">Sin costos ocultos de servidores.</span>
                    </li>
                     <li className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-400 mr-3-mt-1 flex-shrink-0" />
                        <span className="text-gray-300">Adaptadas a los nichos más fuertes en Ecuador.</span>
                    </li>
                </ul>
            </div>

            <div className="text-center mt-20">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-200 mb-4">
                    Haz crecer tu negocio hoy con Boot & Landing 🚀
                </h3>
                <Link href="/contacto" className="inline-block bg-primary text-primary-foreground text-lg font-semibold px-10 py-4 rounded-full shadow-lg hover:bg-primary/90 transition duration-300 transform hover:scale-105">
                    Solicita tu demo gratuita
                </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900/80 text-white py-12">
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
    </div>
    </>
  );
}

    
