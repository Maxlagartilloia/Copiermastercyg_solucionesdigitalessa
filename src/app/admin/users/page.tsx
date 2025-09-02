
'use client';

import * as React from 'react';
import { ShieldCheck, Users, Trash2, UserPlus, Check, ChevronsUpDown } from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { getRoleLessUsers, RoleLessUser } from './actions';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { UserRegistrationRequest } from '@/lib/types';


interface UserWithRole {
    uid: string;
    role: 'admin' | 'technician' | 'client';
    email: string; 
    name?: string;
}


export default function UsersPage() {
  const { toast } = useToast();
  const [usersWithRoles, setUsersWithRoles] = React.useState<UserWithRole[]>([]);
  const [roleLessUsers, setRoleLessUsers] = React.useState<RoleLessUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedUserUid, setSelectedUserUid] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<'admin' | 'technician' | 'client' | ''>('');
  const [userToRemove, setUserToRemove] = React.useState<UserWithRole | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);


  const fetchRoleData = React.useCallback(async () => {
     setIsLoading(true);
      // Fetch users with roles from Firestore
      const roleDocRef = doc(db, 'roles', 'userRoles');
      
      const unsubscribeRoles = onSnapshot(roleDocRef, async (docSnap) => {
          const rolesData = docSnap.exists() ? docSnap.data() : {};
          const uidsWithRoles = rolesData ? Object.keys(rolesData) : [];

          // Fetch details for users with roles
          const usersList: UserWithRole[] = [];
          for (const uid of uidsWithRoles) {
            // A super admin might not be in registrationRequests, so we need a fallback.
             usersList.push({ uid, email: 'Cargando...', name: 'Cargando...', role: rolesData[uid] });
          }
          setUsersWithRoles(usersList);
          
          // Fetch users without roles using the server action
          try {
            const roleLess = await getRoleLessUsers();
            setRoleLessUsers(roleLess);
          } catch(e) {
            console.error(e);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los usuarios sin rol." });
          }


          setIsLoading(false);
      }, (error) => {
          console.error("Error fetching roles:", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los roles." });
          setIsLoading(false);
      });

      return () => unsubscribeRoles();
  }, [toast]);
  
  // Fetch registration request data to enrich user details
  const fetchRegistrationDetails = React.useCallback(async () => {
      if (usersWithRoles.length === 0) return;

      const registrationRequestsRef = collection(db, 'registrationRequests');
      const snapshot = await getDocs(registrationRequestsRef);
      const registrationData = snapshot.docs.reduce((acc, doc) => {
          const data = doc.data() as UserRegistrationRequest;
          if (data.uid) {
              acc[data.uid] = { email: data.email, name: data.name };
          }
          return acc;
      }, {} as Record<string, {email: string, name: string}>);

      setUsersWithRoles(prevUsers => prevUsers.map(user => ({
          ...user,
          email: registrationData[user.uid]?.email || user.email,
          name: registrationData[user.uid]?.name || user.name,
      })));

  }, [usersWithRoles]);

  React.useEffect(() => {
    fetchRoleData();
  }, [fetchRoleData]);
  
  React.useEffect(() => {
      if(usersWithRoles.some(u => u.name === 'Cargando...')) {
        fetchRegistrationDetails();
      }
  }, [usersWithRoles, fetchRegistrationDetails]);


  const handleAssignRole = async () => {
    if (!selectedUserUid || !selectedRole) {
        toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona un usuario y un rol.' });
        return;
    }

    const roleDocRef = doc(db, 'roles', 'userRoles');
    try {
        await setDoc(roleDocRef, { [selectedUserUid]: selectedRole }, { merge: true });
        
        // Also update the status of the corresponding registration request if it exists
        const requestQuery = query(collection(db, 'registrationRequests'), where("uid", "==", selectedUserUid));
        const requestSnapshot = await getDocs(requestQuery);
        if (!requestSnapshot.empty) {
            const requestDocRef = requestSnapshot.docs[0].ref;
            await updateDoc(requestDocRef, { status: 'approved' });
        }

        toast({
            title: '¡Rol Asignado!',
            description: `El usuario ahora tiene el rol de ${selectedRole}.`,
        });

        setSelectedUserUid('');
        setSelectedRole('');
        // No need to call fetchRoleData here, onSnapshot will trigger a re-render
    } catch (error) {
        console.error("Error assigning role: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo asignar el rol." });
    }
  };


  const removeRoleInFirestore = async (uid: string) => {
      const roleDocRef = doc(db, 'roles', 'userRoles');
      try {
          const docSnap = await getDoc(roleDocRef);
          if (docSnap.exists()) {
              const roles = docSnap.data();
              delete roles[uid];
              await setDoc(roleDocRef, roles); // Overwrite the document without the deleted role
              toast({
                  title: 'Rol Eliminado',
                  description: `Se ha quitado el rol al usuario.`
              });
              return { success: true };
          }
        return { success: true }; // Nothing to do if doc doesn't exist
      } catch (error: any) {
        console.error("Error removing role: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo quitar el rol. " + error.message,
        });
        return { success: false, error: error.message };
      }
  }

  const handleRemoveRole = async () => {
    if (!userToRemove) return;
    await removeRoleInFirestore(userToRemove.uid);
    setUserToRemove(null);
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
        case 'admin': return <Badge className="bg-red-600 hover:bg-red-700">{role}</Badge>;
        case 'technician': return <Badge variant="secondary">{role}</Badge>;
        case 'client': return <Badge variant="outline">{role}</Badge>;
        default: return <Badge variant="outline">{role}</Badge>
    }
  }


  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck />
          Gestión de Usuarios y Roles
        </h1>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus />Asignar Nuevo Rol</CardTitle>
          <CardDescription>
            Aquí puedes asignar un rol a los usuarios que se han registrado pero que aún no tienen permisos en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-end gap-4">
            <div className="w-full sm:w-1/2">
                <label className="text-sm font-medium mb-2 block">Usuario Sin Rol Asignado</label>
                 <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                                "w-full justify-between",
                                !selectedUserUid && "text-muted-foreground"
                            )}
                        >
                            {selectedUserUid
                                ? roleLessUsers.find((user) => user.uid === selectedUserUid)?.displayName
                                : "Selecciona un usuario..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Buscar por email o nombre..." />
                            <CommandList>
                              <CommandEmpty>No hay usuarios pendientes de rol.</CommandEmpty>
                              <CommandGroup>
                                  {roleLessUsers.map((user) => (
                                      <CommandItem
                                          value={user.email}
                                          key={user.uid}
                                          onSelect={() => {
                                              setSelectedUserUid(user.uid)
                                              setIsPopoverOpen(false)
                                          }}
                                      >
                                          <Check
                                              className={cn(
                                                  "mr-2 h-4 w-4",
                                                  user.uid === selectedUserUid ? "opacity-100" : "opacity-0"
                                              )}
                                          />
                                          <div>
                                              <p>{user.displayName}</p>
                                              <p className="text-xs text-muted-foreground">{user.email}</p>
                                          </div>
                                      </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="w-full sm:w-1/3">
                 <label className="text-sm font-medium mb-2 block">Asignar Rol</label>
                 <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="technician">Técnico</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          <Button onClick={handleAssignRole} className="w-full sm:w-auto" disabled={isLoading}>Asignar Rol</Button>
        </CardContent>
       </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users />Usuarios con Roles Asignados</CardTitle>
            <CardDescription>
                Esta es la lista de usuarios con permisos activos en el sistema.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email del Usuario</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow>
                    ) : usersWithRoles.length > 0 ? (
                        usersWithRoles.map(user => (
                            <TableRow key={user.uid}>
                                <TableCell className="font-medium">{user.email}</TableCell>
                                <TableCell>{user.name || 'N/A'}</TableCell>
                                <TableCell>
                                    {getRoleBadge(user.role)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setUserToRemove(user)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción quitará los permisos especiales a este usuario ({user.email}). No eliminará al usuario del sistema, solo su rol. El usuario ya no podrá acceder a las funciones de su rol anterior.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setUserToRemove(null)}>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleRemoveRole} className="bg-red-600 hover:bg-red-700">Sí, eliminar rol</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={4} className="text-center h-24">No hay usuarios con roles asignados.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    