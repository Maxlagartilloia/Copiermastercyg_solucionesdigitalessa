
'use client';

import * as React from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wrench, PlusCircle, User, Mail, Shield, MapPin, MoreVertical, Trash2, Edit } from 'lucide-react';

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
  DialogFooter,
  DialogClose,
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

interface Technician {
    id: string;
    name: string;
    email: string;
    specialty: string;
    city: string;
}

const technicianSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  email: z.string().email('El correo electrónico no es válido.'),
  specialty: z.string().min(2, 'La especialidad es requerida.'),
  city: z.string().min(3, 'La ciudad es requerida.'),
});

function TechnicianForm({
  onSuccess,
  technician,
}: {
  onSuccess: () => void;
  technician?: Technician | null;
}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof technicianSchema>>({
    resolver: zodResolver(technicianSchema),
    defaultValues: technician || {
      name: '',
      email: '',
      specialty: '',
      city: '',
    },
  });

  React.useEffect(() => {
    if (technician) {
      form.reset(technician);
    } else {
      form.reset({ name: '', email: '', specialty: '', city: '' });
    }
  }, [technician, form]);

  async function onSubmit(values: z.infer<typeof technicianSchema>) {
    try {
      if (technician) {
        // Update existing technician
        const techRef = doc(db, 'technicians', technician.id);
        await updateDoc(techRef, values);
        toast({
          title: 'Técnico Actualizado',
          description: `${values.name} ha sido actualizado.`,
        });
      } else {
        // Add new technician
        await addDoc(collection(db, 'technicians'), {
          ...values,
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Técnico Agregado',
          description: `${values.name} ha sido añadido al equipo.`,
        });
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error saving technician: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `No se pudo ${technician ? 'actualizar' : 'agregar'} al técnico.`,
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
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Carlos Rodriguez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ej: tecnico@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Especialidad</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: Impresoras Ricoh" {...field} />
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
                    <Input placeholder="Ej: Quito" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? 'Guardando...' : (technician ? 'Guardar Cambios' : 'Agregar Técnico')}
        </Button>
      </form>
    </Form>
  );
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedTechnician, setSelectedTechnician] = React.useState<Technician | null>(null);
  const { toast } = useToast();

  const fetchTechnicians = React.useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'technicians'));
      const techsData: Technician[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Technician));
      setTechnicians(techsData);
    } catch(error) {
      console.error("Error fetching technicians:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la lista de técnicos."
      });
    }
  }, [toast]);

  React.useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const handleAddNew = () => {
    setSelectedTechnician(null);
    setIsFormModalOpen(true);
  }

  const handleEdit = (tech: Technician) => {
    setSelectedTechnician(tech);
    setIsFormModalOpen(true);
  }

  const handleDelete = (tech: Technician) => {
    setSelectedTechnician(tech);
    setIsDeleteAlertOpen(true);
  }

  const confirmDelete = async () => {
    if (!selectedTechnician) return;
    try {
        await deleteDoc(doc(db, 'technicians', selectedTechnician.id));
        toast({
            title: 'Técnico Eliminado',
            description: `${selectedTechnician.name} ha sido eliminado del sistema.`,
        });
        setIsDeleteAlertOpen(false);
        setSelectedTechnician(null);
        fetchTechnicians(); // Re-fetch
    } catch(error) {
        console.error("Error deleting technician:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo eliminar al técnico."
        });
    }
  }


  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench />
          Gestión de Técnicos
        </h1>
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Técnico
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Técnicos</CardTitle>
          <CardDescription>
            Este es el personal disponible para atender las solicitudes de soporte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><User className="inline-block mr-2 h-4 w-4" />Nombre</TableHead>
                <TableHead><Mail className="inline-block mr-2 h-4 w-4" />Email</TableHead>
                <TableHead><Shield className="inline-block mr-2 h-4 w-4" />Especialidad</TableHead>
                <TableHead><MapPin className="inline-block mr-2 h-4 w-4" />Ciudad</TableHead>
                <TableHead className="w-[50px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.length > 0 ? (
                technicians.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium">{tech.name}</TableCell>
                    <TableCell>{tech.email}</TableCell>
                    <TableCell>{tech.specialty}</TableCell>
                    <TableCell>{tech.city}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(tech)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(tech)} className="text-red-600 focus:text-red-700">
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
                    No hay técnicos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Modal for Add/Edit */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTechnician ? 'Editar Técnico' : 'Nuevo Técnico'}</DialogTitle>
              <DialogDescription>
                {selectedTechnician ? 'Modifica los datos del técnico.' : 'Añade un nuevo miembro al equipo de soporte técnico.'}
              </DialogDescription>
            </DialogHeader>
            <TechnicianForm 
                onSuccess={() => {
                  setIsFormModalOpen(false);
                  fetchTechnicians();
                }}
                technician={selectedTechnician}
            />
          </DialogContent>
        </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente al técnico
                 <span className="font-bold"> {selectedTechnician?.name}</span> del sistema.
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

    