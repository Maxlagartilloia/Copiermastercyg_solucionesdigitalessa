
'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  text: string;
  isUser: boolean;
}

export default function KnowledgeBasePage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // TODO: Implement RAG flow call
    // const response = await callRagAgent(input);
    // For now, simulate a response
    await new Promise(res => setTimeout(res, 1500));
    const aiResponse: Message = {
      text: "Respuesta simulada: La configuración del equipo XYZ requiere ajustar el parámetro de red a '192.168.1.1'. Consulta el manual técnico en la sección 3.2 para más detalles.",
      isUser: false
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-8">
      <Card className="flex flex-col flex-1">
        <CardHeader>
          <CardTitle>Base de Conocimiento (RAG)</CardTitle>
          <CardDescription>
            Realiza consultas técnicas sobre equipos y procedimientos. La IA buscará en la documentación para darte una respuesta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <ScrollArea className="flex-1 pr-4 mb-4 h-96">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-md p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
               {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-md p-3 rounded-lg bg-muted">
                    <p className="animate-pulse">Pensando...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: ¿Cómo configuro el escáner en una Ricoh MP C3004?"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
