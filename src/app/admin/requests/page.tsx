
'use client';

import * as React from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserPlus, Check, X, Info } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { UserRegistrationRequest } from '@/lib/types';
import { useRouter } from 'next/navigation';

// This page is now informational. It shows who has registered.
// The actual role assignment is done in the Users & Roles page.

async function markRequest(requestId: string, status: 'approved' | 'rejected') {
    try {
        const requestRef = doc(db, 'registrationRequests', requestId);
        await updateDoc(requestRef, { status });
        return { success: true };
    } catch (error) {
        console.error("Error marking request:", error);
        return { success: false, error: "No se pudo actualizar la solicitud en la base de datos." };
    }
}


export default function UserRequestsPage() {
  const [requests, setRequests] = React.useState<UserRegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    const q = query(collection(db, "registrationRequests"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData: UserRegistrationRequest[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() ?? new Date().toISOString(),
      } as UserRegistrationRequest));
      setRequests(requestsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching requests: ", error);
      setIsLoading(false);
      toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las solicitudes."
      })
    });

    return () => unsubscribe();
  }, [toast]);

  const handleApprove = async (requestId: string, userName: string) => {
    const { success, error } = await markRequest(requestId, 'approved');
     if (success) {
        toast({
            title: "Solicitud Aprobada",
            description: `Se ha marcado la solicitud de ${userName} como aprobada. Ahora asigna su rol en la sección 'Usuarios y Roles'.`
        });
        router.push('/admin/users'); // Redirect to assign role
    } else {
         toast({
            variant: "destructive",
            title: "Error",
            description: error || "No se pudo aprobar la solicitud."
        });
    }
  }


  const handleReject = async (requestId: string) => {
    const { success } = await markRequest(requestId, 'rejected');
     if (success) {
        toast({
            title: "Solicitud Rechazada",
            description: `La solicitud ha sido rechazada.`
        });
    } else {
         toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo rechazar la solicitud."
        });
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy, h:mm a", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <UserPlus />
        Solicitudes de Registro
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Registro Pendientes</CardTitle>
          <CardDescription>
            Estos son los usuarios que se han registrado. Aprueba su solicitud para luego poder asignarles un rol en la sección "Usuarios y Roles".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>RUC/CI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="font-medium">{req.name}</div>
                      <div className="text-sm text-muted-foreground">{req.email}</div>
                    </TableCell>
                    <TableCell>{req.company}</TableCell>
                    <TableCell>{req.ruc}</TableCell>
                    <TableCell>{req.phone}</TableCell>
                    <TableCell>{formatDate(req.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                                    <Check className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Aprobar Solicitud</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esto marcará la solicitud de <span className="font-bold">{req.name}</span> como aprobada. El siguiente paso será asignarle un rol en la sección "Usuarios y Roles".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleApprove(req.id, req.name)}>Sí, aprobar y continuar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                                    <X className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Rechazar Solicitud?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción marcará la solicitud de <span className="font-bold">{req.name}</span> como rechazada. No se podrá deshacer.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleReject(req.id)} className="bg-red-600 hover:bg-red-700">Sí, rechazar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay solicitudes pendientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
    </div>
  );
}
