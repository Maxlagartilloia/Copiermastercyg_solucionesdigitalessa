
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { IncidentType, Client } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { cn } from '@/lib/utils';

const incidentTypes: IncidentType[] = [
  'Error de Impresión',
  'Atasco de Papel',
  'Problema de Calidad',
  'Consumibles',
  'Conectividad',
  'Configuración',
  'Otro',
];

const formSchema = z.object({
  institucion: z.string({ required_error: 'Debes seleccionar un cliente.'}),
  ciudad: z.string().min(3, 'La ciudad es requerida.'),
  tipo_incidente: z.enum(incidentTypes, {
    required_error: 'Debes seleccionar un tipo de problema.',
  }),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres.')
    .max(500, 'La descripción debe tener menos de 500 caracteres.'),
  priority: z.enum(['Baja', 'Media', 'Alta', 'Urgente']),
});

interface NewSupportTicketFormProps {
  onSuccess?: () => void;
  userName: string;
  userEmail: string;
}

export function NewSupportTicketForm({ onSuccess, userName, userEmail }: NewSupportTicketFormProps) {
  const { toast } = useToast();
  const [clients, setClients] = React.useState<Client[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ciudad: '',
      description: '',
      priority: 'Media',
    },
  });

  React.useEffect(() => {
    const q = collection(db, 'clients');
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const clientsData: Client[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Client));
        clientsData.sort((a,b) => a.name.localeCompare(b.name));
        setClients(clientsData);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const institutionId = form.watch('institucion');
    if (institutionId) {
        const selectedClient = clients.find(c => c.id === institutionId);
        if (selectedClient) {
            form.setValue('ciudad', selectedClient.city);
        }
    }
  }, [form.watch('institucion'), clients, form.setValue]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userEmail) {
        toast({
            variant: 'destructive',
            title: 'Error de Autenticación',
            description: 'No se pudo verificar tu correo. Por favor, inicia sesión de nuevo.',
        });
        return;
    }

    const selectedClient = clients.find(c => c.id === values.institucion);

    try {
      await addDoc(collection(db, 'supportRequests'), {
        name: userName,
        email: userEmail,
        institucion: selectedClient?.name,
        ciudad: values.ciudad,
        tipo_incidente: values.tipo_incidente,
        description: values.description,
        status: 'Abierto',
        priority: values.priority,
        assignedTo: 'Sin asignar',
        createdAt: serverTimestamp(),
      });

      toast({
        title: '¡Ticket Creado!',
        description: 'Hemos recibido tu solicitud de soporte y te responderemos en breve.',
      });
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Error al Enviar',
        description: 'No se pudo crear tu ticket. Por favor, inténtalo de nuevo.',
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="institucion"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Institución</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value
                                        ? clients.find((client) => client.id === field.value)?.name
                                        : "Selecciona un cliente"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar cliente..." />
                                <CommandEmpty>Ningún cliente encontrado.</CommandEmpty>
                                <CommandGroup>
                                    {clients.map((client) => (
                                        <CommandItem
                                            value={client.name}
                                            key={client.id}
                                            onSelect={() => {
                                                form.setValue("institucion", client.id)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    client.id === field.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {client.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
            />
           <FormField
            control={form.control}
            name="ciudad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Shushufindi" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="tipo_incidente"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Tipo de Problema</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de incidente" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {incidentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Prioridad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona la prioridad" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Baja">Baja</SelectItem>
                                <SelectItem value="Media">Media</SelectItem>
                                <SelectItem value="Alta">Alta</SelectItem>
                                <SelectItem value="Urgente">Urgente</SelectItem>
                            </SelectContent>
                        </Select>
                         <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del Problema</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe detalladamente tu problema o consulta técnica..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? 'Enviando...'
            : 'Crear Ticket'}
        </Button>
      </form>
    </Form>
  );
}
