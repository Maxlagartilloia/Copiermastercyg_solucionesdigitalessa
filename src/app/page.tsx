
'use client';

import * as React from 'react';
import Script from 'next/script';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { SupportButton } from '@/components/SupportButton';


const MARCAS = [
    {
      title: "Ricoh",
      description: "Líder en equipos de oficina y soluciones de impresión de producción. Ofrecemos una amplia gama de productos para satisfacer todas sus necesidades.",
      image: "https://i.postimg.cc/VvZQDmL8/22222.png",
      thumb: "https://i.postimg.cc/SxkZvH32/33333-removebg-preview.png",
      link: "https://www.ricoh.com/"
    },
    {
      title: "Lexmark",
      description: "Soluciones de impresión seguras, confiables y fáciles de usar que optimizan el flujo de trabajo empresarial.",
      image: "https://i.postimg.cc/rynB6yM6/impresora-lexmark-mx722adhe-duplex-70ppm-impresoras-25b0001-tcws-2.png",
      thumb: "https://i.postimg.cc/qvwmVjHm/44-removebg-preview.png",
      link: "https://www.lexmark.com/"
    },
    {
      title: "Kyocera",
      description: "Tecnología de impresión eficiente y sostenible que combina bajo coste con alto rendimiento.",
      image: "https://i.postimg.cc/QxVrV90x/5555.png",
      thumb: "https://i.postimg.cc/jjjMsPsR/6666-removebg-preview.png",
      link: "https://www.kyoceradocumentsolutions.com/"
    }
];

export default function HomePage() {
    const [activeMarca, setActiveMarca] = React.useState(MARCAS[0]);
    const [currentMarcaIndex, setCurrentMarcaIndex] = React.useState(0);


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

        const heroTitle = document.getElementById('hero-title');
        const heroSubtitle = document.getElementById('hero-subtitle');
        const heroButtonsContainer = document.getElementById('hero-buttons');
        let heroInterval: any = null;
        if (heroButtonsContainer && heroTitle && heroSubtitle) {
            const heroButtons = heroButtonsContainer.querySelectorAll('.hero-button');
            let currentHeroIndex = 0;

            const heroContent = [
                { title: '16 años en el mercado', subtitle: 'Impulsando tecnología, conectando empresas, transformando el futuro.' },
                { title: 'Acelera la adopción digital de tu negocio', subtitle: 'Trabajamos con varias marcas reconocidas en Ecuador.' },
                { title: 'Inteligencia Artificial para tu Negocio', subtitle: 'Trabajamos con las mejores marcas reconocidas a nivel mundial' }
            ];
            
            const updateHeroSection = (index: number) => {
                if (!heroContent[index]) return;
                const content = heroContent[index];
                heroTitle.style.opacity = '0';
                heroSubtitle.style.opacity = '0';
                setTimeout(() => {
                    heroTitle.textContent = content.title;
                    heroSubtitle.textContent = content.subtitle;
                    heroTitle.style.opacity = '1';
                    heroSubtitle.style.opacity = '1';
                }, 500);
                heroButtons.forEach((button, btnIndex) => {
                    button.classList.toggle('hero-button-active', btnIndex === index);
                    if(btnIndex === 1) button.textContent = "Marcas";
                    if(btnIndex === 2) button.textContent = "Boot & Landing";
                });
                currentHeroIndex = index;
            }

            const startHeroSlider = () => {
                heroInterval = setInterval(() => {
                    const nextIndex = (currentHeroIndex + 1) % heroContent.length;
                    updateHeroSection(nextIndex);
                }, 7000);
            }

            const resetHeroInterval = () => {
                if (heroInterval) clearInterval(heroInterval);
                startHeroSlider();
            }

            heroButtonsContainer.addEventListener('click', (e) => {
                const button = (e.target as HTMLElement).closest('.hero-button');
                if (button) {
                    const index = parseInt(button.getAttribute('data-index') || '0', 10);
                    updateHeroSection(index);
                    resetHeroInterval();
                }
            });

            updateHeroSection(0);
            startHeroSlider();
        }
        

        if ((window as any).lucide) {
            (window as any).lucide.createIcons();
        }

        return () => {
            if (heroInterval) clearInterval(heroInterval);
            if (player && typeof player.destroy === 'function') {
                player.destroy();
            }
            (window as any).onYouTubeIframeAPIReady = null;
        }

    }, []);

    React.useEffect(() => {
        const marcaInterval = setInterval(() => {
            const nextIndex = (currentMarcaIndex + 1) % MARCAS.length;
            setCurrentMarcaIndex(nextIndex);
            setActiveMarca(MARCAS[nextIndex]);
        }, 5000);

        return () => clearInterval(marcaInterval);
    }, [currentMarcaIndex]);

    const handleMarcaClick = (index: number) => {
        setCurrentMarcaIndex(index);
        setActiveMarca(MARCAS[index]);
    }


    return (
        <>
            <Head>
                <title>Copiermaster C&G Soluciones Digitales S.A</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <Script src="https://unpkg.com/lucide@latest" strategy="lazyOnload" onReady={() => {
                if ((window as any).lucide) {
                    (window as any).lucide.createIcons();
                }
            }}/>

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
                .hero-button-active {
                    background-color: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                }
                .marca-button {
                    opacity: 0.6;
                    transition: all 0.3s ease-in-out;
                }
                .marca-button-active {
                    opacity: 1;
                    transform: scale(1.1);
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                }
                #marcas-display {
                    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                }
                #marcas-display:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                }
            `}</style>

            <div className="bg-background">
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
                            <Link href="/" className="text-primary font-semibold transition duration-300">Inicio</Link>
                            <Link href="/soluciones" className="text-foreground hover:text-primary font-semibold transition duration-300">Soluciones</Link>
                            <Link href="/aima" className="text-foreground hover:text-primary font-semibold transition duration-300">Boot &amp; Landing</Link>
                            <Link href="/nosotros" className="text-foreground hover:text-primary font-semibold transition duration-300">Nosotros</Link>
                            <Link href="/contacto" className="text-foreground hover:text-primary font-semibold transition duration-300">Contacto</Link>
                        </div>
                    </div>

                    <div id="mobile-menu" className="hidden md:hidden bg-white/95">
                        <Link href="/" className="block py-3 px-6 text-primary font-semibold">Inicio</Link>
                        <Link href="/soluciones" className="block py-3 px-6 text-foreground hover:bg-gray-100">Soluciones</Link>
                        <Link href="/aima" className="block py-3 px-6 text-foreground hover:bg-gray-100">Boot &amp; Landing</Link>
                        <Link href="/nosotros" className="block py-3 px-6 text-foreground hover:bg-gray-100">Nosotros</Link>
                        <Link href="/contacto" className="block py-3 px-6 text-foreground hover:bg-gray-100">Contacto</Link>
                    </div>
                </nav>

                <header id="inicio" className="relative text-white overflow-hidden flex flex-col justify-end pt-32 md:pt-40">
                    <div className="relative h-[70vh]">
                         <div id="hero-video-container" className="top-0">
                            <div id="hero-video-player"></div>
                        </div>
                        <div className="absolute inset-0 bg-black opacity-60"></div>
                        
                        <div className="relative container mx-auto px-6 lg:px-8 z-10 h-full flex items-end">
                            <div className="max-w-4xl text-center md:text-left pb-8">
                                <h1 id="hero-title" className="text-xl lg:text-2xl font-extrabold mb-4 transition-opacity duration-500">
                                </h1>
                                <p id="hero-subtitle" className="text-sm lg:text-base font-medium mb-8 text-gray-300 transition-opacity duration-500">
                                </p>
                                <Link href="/soluciones" className="bg-primary text-primary-foreground text-lg font-semibold px-10 py-2 rounded-full shadow-lg hover:bg-primary/90 transition duration-300 transform hover:scale-105 inline-block">
                                    Conoce Más
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div id="hero-buttons" className="relative bg-black bg-opacity-30 p-4 z-10">
                        <div className="container mx-auto flex justify-center md:justify-start space-x-2">
                            <button data-index="0" className="hero-button text-white px-4 py-2 rounded-lg font-semibold transition duration-300 hover:bg-gray-700">Copiermaster C&G</button>
                            <button data-index="1" className="hero-button text-white px-4 py-2 rounded-lg font-semibold transition duration-300 hover:bg-gray-700">Marcas</button>
                            <button data-index="2" className="hero-button text-white px-4 py-2 rounded-lg font-semibold transition duration-300 hover:bg-gray-700">Boot &amp; Landing</button>                        </div>
                    </div>
                </header>

                <section className="py-20 bg-card">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-foreground mb-4">Nuestras Soluciones de Outsourcing de Impresión</h2>
                            <p className="text-lg text-muted-foreground mt-4">Diseñamos un ecosistema de impresión a la medida de tus objetivos.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-background p-8 rounded-2xl shadow-lg flex items-start space-x-4">
                                <i data-lucide="printer" className="h-8 w-8 text-primary"></i>
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">Gestión de Flota de Impresión</h3>
                                    <p className="text-muted-foreground">Equipos, consumibles, mantenimiento y soporte en un único servicio predecible.</p>
                                </div>
                            </div>
                            <div className="bg-background p-8 rounded-2xl shadow-lg flex items-start space-x-4">
                                <i data-lucide="file-scan" className="h-8 w-8 text-primary"></i>
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">Digitalización y Gestión Documental</h3>
                                    <p className="text-muted-foreground">Convierta sus archivos en activos digitales seguros, accesibles y fáciles de gestionar.</p>
                                </div>
                            </div>
                            <div className="bg-background p-8 rounded-2xl shadow-lg flex items-start space-x-4">
                                <i data-lucide="lock" className="h-8 w-8 text-primary"></i>
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">Impresión Segura</h3>
                                    <p className="text-muted-foreground">Proteja su información confidencial con soluciones de autenticación y control de acceso.</p>
                                </div>
                            </div>
                            <div className="bg-background p-8 rounded-2xl shadow-lg flex items-start space-x-4">
                                <i data-lucide="leaf" className="h-8 w-8 text-primary"></i>
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">Sostenibilidad</h3>
                                    <p className="text-muted-foreground">Reduzca su huella de carbono con equipos eficientes y políticas de impresión inteligentes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-background">
                    <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/2">
                            <Image src="https://i.postimg.cc/fR9njGGG/Captura.png" alt="Soluciones Tecnológicas" width={600} height={400} className="w-full h-auto rounded-lg shadow-xl"/>
                        </div>
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl font-bold text-foreground mb-4">Descubre nuestras soluciones tecnológicas</h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <i data-lucide="printer" className="h-8 w-8 text-primary mt-1"></i>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground">Servicio de impresión gestionado</h3>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <i data-lucide="share-2" className="h-8 w-8 text-primary mt-1"></i>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground">Comunicaciones gráficas</h3>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <i data-lucide="sparkles" className="h-8 w-8 text-primary mt-1"></i>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground">Transformación Digital</h3>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <i data-lucide="eye" className="h-8 w-8 text-primary mt-1"></i>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground">Visual Comunication</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="marcas" className="py-20 bg-secondary">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Nuestras Marcas Aliadas</h2>
                        <p className="text-xl text-muted-foreground mb-12">Trabajamos con los líderes de la industria para ofrecerte la mejor tecnología.</p>
                        <div id="marcas-display" className="bg-card p-8 rounded-2xl shadow-xl max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 border">
                            <div className="md:w-1/2">
                                 <Image id="marca-image" src={activeMarca.image} alt={`Imagen de producto de ${activeMarca.title}`} width={500} height={500} className="max-h-80 mx-auto transition-opacity duration-500 ease-in-out" />
                            </div>
                            <div className="md:w-1/2 text-left flex flex-col self-stretch">
                                <h3 id="marca-title" className="text-4xl font-bold text-foreground mb-4 transition-opacity duration-500 ease-in-out">{activeMarca.title}</h3>
                                <p id="marca-description" className="text-muted-foreground mb-6 flex-grow transition-opacity duration-500 ease-in-out">{activeMarca.description}</p>
                                <a id="marca-link" href={activeMarca.link} target="_blank" rel="noopener noreferrer" className="bg-primary text-primary-foreground text-md font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-primary/90 transition duration-300 transform hover:scale-105 inline-block text-center mt-auto">
                                    Conoce más de la marca
                                </a>
                            </div>
                        </div>
                        <div id="marcas-buttons" className="mt-8 flex justify-center items-center flex-wrap gap-4">
                            {MARCAS.map((marca, index) => (
                                <button
                                    key={index}
                                    data-index={index}
                                    onClick={() => handleMarcaClick(index)}
                                    className={`marca-button bg-card p-4 rounded-lg shadow-md hover:shadow-xl border ${currentMarcaIndex === index ? 'marca-button-active' : ''}`}
                                >
                                    <Image src={marca.thumb} alt={marca.title} className="h-10" width={100} height={40}/>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-background">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold text-foreground mb-12">Resultados que Hablan por Sí Mismos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="bg-card p-8 rounded-2xl shadow-lg border-t-4 border-primary">
                                <p className="text-5xl font-extrabold text-primary mb-2">30%</p>
                                <p className="text-lg font-semibold text-muted-foreground">Reducción Promedio de Costos</p>
                            </div>
                            <div className="bg-card p-8 rounded-2xl shadow-lg border-t-4 border-primary">
                                <p className="text-5xl font-extrabold text-primary mb-2">99%</p>
                                <p className="text-lg font-semibold text-muted-foreground">Uptime Garantizado de Equipos</p>
                            </div>
                            <div className="bg-card p-8 rounded-2xl shadow-lg border-t-4 border-primary">
                                <p className="text-5xl font-extrabold text-primary mb-2">40%</p>
                                <p className="text-lg font-semibold text-muted-foreground">Aumento de Productividad del Equipo de TI</p>
                            </div>
                            <div className="bg-card p-8 rounded-2xl shadow-lg border-t-4 border-primary">
                                <p className="text-5xl font-extrabold text-primary mb-2">100%</p>
                                <p className="text-lg font-semibold text-muted-foreground">Satisfacción de Nuestros Clientes</p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="bg-gray-800 text-white py-12">
                    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8">
                        <div>
                            <Image src="https://i.postimg.cc/6qRNQd57/468963711-3994290450845859-6671631898219414239-n-removebg-preview.webp" alt="Copiermaster C&G Logo" width={144} height={144} className="h-36 w-auto mb-4" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-4">Marcas</h4>
                            <ul className="space-y-2">
                                <li><a href="#marcas" className="text-gray-400 hover:text-primary transition duration-300">Nuestras Marcas</a></li>
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
