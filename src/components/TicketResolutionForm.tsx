
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { Input } from './ui/input';

const formSchema = z.object({
  resolution_details: z
    .string()
    .min(10, 'Debes detallar las actividades realizadas.')
    .max(1500, 'Las actividades no pueden exceder los 1500 caracteres.'),
  resolution_parts: z.string().optional().describe("Repuestos o insumos utilizados"),
  pending_activities: z.string().optional().describe("Actividades que quedaron pendientes"),
  observations: z.string().optional().describe("Observaciones generales"),
});

interface ActivityReportFormProps {
  ticketId: string;
  userName: string;
  onSuccess?: () => void;
}

export function ActivityReportForm({ ticketId, userName, onSuccess }: ActivityReportFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resolution_details: '',
      resolution_parts: '',
      pending_activities: '',
      observations: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const ticketRef = doc(db, 'supportRequests', ticketId);
      await updateDoc(ticketRef, {
        status: 'Resuelto',
        resolvedAt: serverTimestamp(),
        resolvedBy: userName,
        resolution_details: values.resolution_details,
        resolution_parts: values.resolution_parts,
        pending_activities: values.pending_activities,
        observations: values.observations,
      });

      toast({
        title: '¡Ticket Resuelto y Reportado!',
        description: 'Se ha guardado el reporte de actividades.',
      });
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating document: ', error);
      toast({
        variant: 'destructive',
        title: 'Error al Guardar',
        description: 'No se pudo guardar el reporte. Por favor, inténtalo de nuevo.',
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="resolution_details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actividades Realizadas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: 1. Sacar contadores en cliente X.&#10;2. Revisar atasco de papel en impresora Y."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="pending_activities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actividades Pendientes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Queda pendiente cambio de fusor en equipo Z."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="resolution_parts"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Repuestos o Insumos Utilizados</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: Kit de mantenimiento MK-1150, Toner TK-1150" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
         <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Se solicita toner para la Xerox B405."
                  className="min-h-[80px]"
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
            ? 'Guardando...'
            : 'Confirmar y Resolver Ticket'}
        </Button>
      </form>
    </Form>
  );
}
