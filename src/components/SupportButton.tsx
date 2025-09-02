
'use client';

import * as React from 'react';
import { MessageSquare, Phone, Bot } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SupportButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  // TODO: Replace with your actual WhatsApp number and a default message
  const whatsappNumber = "593985380150";
  const whatsappMessage = "Hola, estoy interesado en sus servicios de Copiermaster.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  
  return (
    <div 
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className={cn(
        "flex flex-col gap-3 transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-3 bg-primary text-primary-foreground py-2 px-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Phone className="h-5 w-5" />
          <span className="font-semibold">Ventas</span>
        </a>
        <a 
          href="/login"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-primary text-primary-foreground py-2 px-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Bot className="h-5 w-5" />
          <span className="font-semibold">Asistencia</span>
        </a>
      </div>

      <button
        className="bg-primary text-primary-foreground rounded-full shadow-lg w-16 h-16 flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-110"
        aria-label="Abrir opciones de contacto"
      >
        <MessageSquare className="h-8 w-8" />
      </button>
    </div>
  );
}
