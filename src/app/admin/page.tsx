
"use client";

import * as React from "react";
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  Timestamp,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Wrench, Inbox, PlusCircle, LayoutDashboard, Ticket, Clock, CheckCircle, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import type { SupportRequest, AssignedTo, Technician } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, app } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewSupportTicketForm } from "@/components/NewSupportTicketForm";
import { ActivityReportForm } from "@/components/TicketResolutionForm";

const ADMIN_EMAIL = "serviciotecnico@copiermastercyg.com.ec";

type FirestoreSupportRequest = Omit<SupportRequest, 'createdAt'> & {
    createdAt: Timestamp | null;
};

type UserRole = 'admin' | 'technician' | 'client' | null;

type TicketStats = {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
}

export default function AdminDashboardPage() {
  const [requests, setRequests] = React.useState<SupportRequest[]>([]);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [user, setUser] = React.useState<User | null>(null);
  const [userRole, setUserRole] = React.useState<UserRole>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = React.useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<SupportRequest | null>(null);
  const [stats, setStats] = React.useState<TicketStats>({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const auth = getAuth(app);
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      setUser(currentUser);
      if (currentUser) {
        // This is a simplified role check. The definitive check is in the layout.
        const idTokenResult = await currentUser.getIdTokenResult(true); 
        const claimsRole = idTokenResult.claims.role;
        
        if (claimsRole === 'admin' || currentUser.email === ADMIN_EMAIL) {
          setUserRole('admin');
        } else if (claimsRole === 'technician') {
          setUserRole('technician');
        } else {
           // We fetch user's email for filtering, so we assume 'client' if not admin/tech
          setUserRole('client');
        }
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchRequests = React.useCallback(async () => {
    if (!userRole || !user) return;

    let requestsQuery;
    if (userRole === 'admin') {
        requestsQuery = query(collection(db, "supportRequests"), orderBy("createdAt", "desc"));
    } else if (userRole === 'technician' && user?.displayName) {
        requestsQuery = query(
          collection(db, "supportRequests"), 
          where("assignedTo", "==", user.displayName),
          orderBy("createdAt", "desc")
        );
    } else if (userRole === 'client' && user?.email) {
        requestsQuery = query(
          collection(db, "supportRequests"), 
          where("email", "==", user.email),
          orderBy("createdAt", "desc")
        );
    } else {
        setRequests([]);
        return; 
    }

    try {
        const querySnapshot = await getDocs(requestsQuery);
        const requestsData: SupportRequest[] = [];
        const newStats: TicketStats = { total: 0, open: 0, inProgress: 0, resolved: 0 };
        
        querySnapshot.forEach((doc) => {
            const data = doc.data() as FirestoreSupportRequest;
            const requestItem: SupportRequest = {
                ...data,
                id: doc.id,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                priority: data.priority || 'Media',
                status: data.status || 'Abierto',
                assignedTo: data.assignedTo || 'Sin asignar'
            };
            requestsData.push(requestItem);

            // Calculate stats for admin or client
            newStats.total++;
            if (requestItem.status === 'Abierto') newStats.open++;
            if (requestItem.status === 'En Progreso' || requestItem.status === 'En Espera') newStats.inProgress++;
            if (requestItem.status === 'Resuelto') newStats.resolved++;
        });
        
        setRequests(requestsData);
        setStats(newStats);
    } catch (error) {
        console.error("Error fetching support requests:", error);
        toast({
            variant: "destructive",
            title: "Error de Carga",
            description: "No se pudieron cargar las solicitudes de soporte.",
        });
    }
  }, [user, userRole, toast]);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
  
  React.useEffect(() => {
    if (userRole === 'admin') {
        const fetchTechnicians = async () => {
            try {
                const techQuery = query(collection(db, 'technicians'));
                const snapshot = await getDocs(techQuery);
                const techsData: Technician[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Technician));
                techsData.sort((a, b) => (a.city || "").localeCompare(b.city || ""));
                setTechnicians(techsData);
            } catch (error) {
                console.error("Error fetching technicians:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo cargar la lista de técnicos."
                });
            }
        };
        fetchTechnicians();
    }
  }, [userRole, toast]);

  const techniciansByCity = React.useMemo(() => {
    return technicians.reduce((acc, tech) => {
        const city = tech.city || 'Sin ciudad';
        if (!acc[city]) {
            acc[city] = [];
        }
        acc[city].push(tech);
        return acc;
    }, {} as Record<string, Technician[]>);
  }, [technicians]);

  const handleStatusUpdate = async (id: string, status: SupportRequest['status'], assignedTo?: AssignedTo) => {
    const isAllowed = userRole === 'admin' || userRole === 'technician';
    if (!isAllowed) {
        toast({ variant: "destructive", title: "Acción no permitida" });
        return;
    }
    
    const requestRef = doc(db, "supportRequests", id);
    try {
        const updateData: any = { status };
        if (assignedTo && userRole === 'admin') {
            updateData.assignedTo = assignedTo;
        }

        await updateDoc(requestRef, updateData);
        await fetchRequests(); // Re-fetch data after update

        toast({
            title: "Solicitud Actualizada",
            description: `La solicitud ha sido actualizada a ${status}.`,
        });
    } catch (error) {
        console.error("Error updating document:", error);
        toast({
            variant: "destructive",
            title: "Error al Actualizar",
            description: "No se pudo actualizar la solicitud.",
        });
    }
  }

  const handleOpenResolveModal = (ticket: SupportRequest) => {
    setSelectedTicket(ticket);
    setIsResolveModalOpen(true);
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy, h:mm a", { locale: es });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha inválida";
    }
  };
  
  const getStatusBadge = (status: SupportRequest['status']) => {
    switch (status) {
        case 'Abierto':
            return <Badge variant="destructive">{status}</Badge>;
        case 'En Progreso':
            return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">{status}</Badge>;
        case 'En Espera':
            return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">{status}</Badge>;
        case 'Resuelto':
            return <Badge className="bg-green-700 hover:bg-green-800 text-white">{status}</Badge>;
        case 'Cerrado':
            return <Badge variant="secondary">{status}</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPageTitle = () => {
    switch (userRole) {
        case 'admin': return "Dashboard de Administrador";
        case 'technician': return "Mis Tareas Asignadas";
        case 'client': return "Mi Portal de Cliente";
        default: return "Cargando...";
    }
  }

  const getCardTitle = () => {
    switch (userRole) {
        case 'admin': return "Gestión de Tickets de Soporte";
        case 'technician': return "Mis Tickets Asignados";
        case 'client': return "Mi Historial de Tickets";
        default: return "Tickets";
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Cargando...</p>
      </div>
    );
  }
  
  const canPerformActions = userRole === 'admin' || userRole === 'technician';

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard />
            {getPageTitle()}
        </h1>
        <Dialog open={isNewTicketModalOpen} onOpenChange={setIsNewTicketModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Ticket de Soporte</DialogTitle>
              <DialogDescription>
                Describe tu problema o consulta técnica y nuestro equipo se pondrá en contacto contigo.
              </DialogDescription>
            </DialogHeader>
            <NewSupportTicketForm 
              onSuccess={() => {
                setIsNewTicketModalOpen(false);
                fetchRequests(); // Re-fetch data after creating a new ticket
              }} 
              userName={user.displayName || ""}
              userEmail={user.email || ""}
            />
          </DialogContent>
        </Dialog>
      </div>

       {(userRole === 'admin' || userRole === 'client') && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tickets Abiertos</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.open}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">En Progreso / Espera</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tickets Resueltos</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-700">{stats.resolved}</div>
                </CardContent>
            </Card>
        </div>
       )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{getCardTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {userRole === 'admin' && <TableHead className="w-[100px]">Ticket ID</TableHead>}
                  <TableHead>Cliente</TableHead>
                  <TableHead>Asunto</TableHead>
                  {userRole !== 'client' && <TableHead>Asignado a</TableHead>}
                  <TableHead className="w-[120px] text-center">Prioridad</TableHead>
                  <TableHead className="w-[150px] text-center">Estado</TableHead>
                  <TableHead className="w-[180px]">Recibido</TableHead>
                  {canPerformActions && <TableHead className="w-[50px] text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      {userRole === 'admin' && <TableCell className="font-mono text-xs">#{req.id.substring(0,6)}</TableCell>}
                      <TableCell>
                        <div className="font-medium">{req.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {req.email}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium pt-1">
                          {req.institucion} ({req.ciudad})
                        </div>
                      </TableCell>
                      <TableCell>{req.tipo_incidente || 'No especificado'}</TableCell>
                       {userRole !== 'client' && (
                        <TableCell>
                           {req.assignedTo && req.assignedTo !== 'Sin asignar' ? (
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{req.assignedTo}</span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground">Sin asignar</span>
                            )}
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                          {req.priority === 'Urgente' && <Badge variant="destructive" className="bg-red-700 hover:bg-red-700">{req.priority}</Badge>}
                          {req.priority === 'Alta' && <Badge variant="destructive">{req.priority}</Badge>}
                          {req.priority === 'Media' && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">{req.priority}</Badge>}
                          {req.priority === 'Baja' && <Badge className="bg-green-700 hover:bg-green-800 text-white">{req.priority}</Badge>}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(req.status)}
                      </TableCell>
                      <TableCell>{formatDate(req.createdAt)}</TableCell>
                      {canPerformActions && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                              <DropdownMenuSeparator />
                                {userRole === 'admin' && (
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>Asignar a Técnico</DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            {Object.keys(techniciansByCity).length > 0 ? (
                                                Object.entries(techniciansByCity).map(([city, techs]) => (
                                                    <DropdownMenuGroup key={city}>
                                                        <Badge variant="secondary" className="w-full justify-start my-1">{city}</Badge>
                                                        {techs.map(tech => (
                                                            <DropdownMenuItem key={tech.id} onClick={() => handleStatusUpdate(req.id, "En Progreso", tech.name)}>
                                                                {tech.name}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuGroup>
                                                ))
                                            ) : (
                                                <DropdownMenuItem disabled>No hay técnicos disponibles</DropdownMenuItem>
                                            )}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                )}
                               <DropdownMenuItem
                                onClick={() => handleStatusUpdate(req.id, "En Espera")}
                              >
                                Marcar En Espera
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenResolveModal(req)}
                                className="text-green-700 focus:text-green-800"
                              >
                                Marcar como Resuelto
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={userRole === 'admin' ? 8 : (userRole === 'client' ? 5 : 7)} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Inbox className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {userRole === 'admin' && "Aún no hay solicitudes de soporte."}
                          {userRole ==='client' && "No tienes tickets de soporte activos."}
                          {userRole ==='technician' && "No tienes tickets asignados."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {selectedTicket && (
        <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reportar Actividades y Resolver Ticket #{selectedTicket.id.substring(0,6)}</DialogTitle>
                    <DialogDescription>
                        Detalla el trabajo realizado. Esta información es crucial para el historial y los reportes.
                    </DialogDescription>
                </DialogHeader>
                <ActivityReportForm 
                    ticketId={selectedTicket.id}
                    onSuccess={() => {
                        setIsResolveModalOpen(false);
                        setSelectedTicket(null);
                        fetchRequests(); // Re-fetch on success
                    }}
                    userName={user.displayName || "Usuario"}
                />
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

    