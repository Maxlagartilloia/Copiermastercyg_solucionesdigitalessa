
'use client';

import * as React from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users, PlusCircle, Building, MapPin, Phone, MoreVertical, Trash2, Edit } from 'lucide-react';

import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Client } from '@/lib/types';


const clientSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  city: z.string().min(3, 'La ciudad es requerida.'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
});

function ClientForm({
  onSuccess,
  client,
}: {
  onSuccess: () => void;
  client?: Client | null;
}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {
      name: '',
      city: '',
      contact_person: '',
      phone: '',
    },
  });

  React.useEffect(() => {
    if (client) {
      form.reset(client);
    } else {
      form.reset({ name: '', city: '', contact_person: '', phone: '' });
    }
  }, [client, form]);

  async function onSubmit(values: z.infer<typeof clientSchema>) {
    try {
      if (client) {
        // Update existing client
        const clientRef = doc(db, 'clients', client.id);
        await updateDoc(clientRef, values);
        toast({
          title: 'Cliente Actualizado',
          description: `Los datos de ${values.name} han sido actualizados.`,
        });
      } else {
        // Add new client
        await addDoc(collection(db, 'clients'), {
          ...values,
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Cliente Agregado',
          description: `${values.name} ha sido añadido a la lista.`,
        });
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error saving client: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `No se pudo ${client ? 'actualizar' : 'agregar'} al cliente.`,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Institución</FormLabel>
              <FormControl>
                <Input placeholder="Ej: GAD Municipal de Shushufindi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Shushufindi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="contact_person"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Persona de Contacto (Opcional)</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: Ing. Ana Torres" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Teléfono (Opcional)</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: 0991234567" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? 'Guardando...' : (client ? 'Guardar Cambios' : 'Agregar Cliente')}
        </Button>
      </form>
    </Form>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const { toast } = useToast();

  const fetchClients = React.useCallback(async () => {
    try {
      const q = collection(db, 'clients');
      const snapshot = await getDocs(q);
      const clientsData: Client[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Client));
      clientsData.sort((a,b) => a.name.localeCompare(b.name));
      setClients(clientsData);
    } catch(error) {
      console.error("Error fetching clients:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la lista de clientes."
      });
    }
  }, [toast]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsFormModalOpen(true);
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  }

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteAlertOpen(true);
  }

  const confirmDelete = async () => {
    if (!selectedClient) return;
    try {
        await deleteDoc(doc(db, 'clients', selectedClient.id));
        toast({
            title: 'Cliente Eliminado',
            description: `${selectedClient.name} ha sido eliminado del sistema.`,
        });
        setIsDeleteAlertOpen(false);
        setSelectedClient(null);
        fetchClients(); // Re-fetch
    } catch(error) {
        console.error("Error deleting client:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo eliminar al cliente."
        });
    }
  }


  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users />
          Gestión de Clientes
        </h1>
        <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
            <DialogTrigger asChild>
                 <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Cliente
                </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
              <DialogDescription>
                {selectedClient ? 'Modifica los datos del cliente.' : 'Añade una nueva institución a tu lista de clientes.'}
              </DialogDescription>
            </DialogHeader>
            <ClientForm 
                onSuccess={() => {
                  setIsFormModalOpen(false);
                  fetchClients();
                }}
                client={selectedClient}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Instituciones y empresas a las que se les brinda servicio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Building className="inline-block mr-2 h-4 w-4" />Institución</TableHead>
                <TableHead><MapPin className="inline-block mr-2 h-4 w-4" />Ciudad</TableHead>
                <TableHead><Users className="inline-block mr-2 h-4 w-4" />Contacto</TableHead>
                <TableHead><Phone className="inline-block mr-2 h-4 w-4" />Teléfono</TableHead>
                <TableHead className="w-[50px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.city}</TableCell>
                    <TableCell>{client.contact_person || 'N/A'}</TableCell>
                    <TableCell>{client.phone || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(client)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(client)} className="text-red-600 focus:text-red-700">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No hay clientes registrados. Agrega uno para empezar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente
                 <span className="font-bold"> {selectedClient?.name}</span> del sistema.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Sí, eliminar
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    </div>
  );
}

    