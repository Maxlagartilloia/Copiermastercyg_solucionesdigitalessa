
'use client';

import * as React from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { db, app } from '@/lib/firebase';
import type { SupportRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#d946ef'];

interface ChartData {
  name: string;
  count: number;
}

interface Stats {
  total: number;
  resolved: number;
  satisfaction: string;
  avgResolutionTime: string;
}

export default function ClientReportsPage() {
  const [allTickets, setAllTickets] = React.useState<SupportRequest[]>([]);
  const [filteredTickets, setFilteredTickets] = React.useState<SupportRequest[]>([]);
  const [ticketStatusData, setTicketStatusData] = React.useState<ChartData[]>([]);
  const [incidentTypeData, setIncidentTypeData] = React.useState<ChartData[]>([]);
  const [stats, setStats] = React.useState<Stats>({ total: 0, resolved: 0, satisfaction: 'N/A', avgResolutionTime: 'N/A' });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [user, setUser] = React.useState<User | null>(null);
  const { toast } = useToast();
  
  const statusChartRef = React.useRef(null);
  const incidentChartRef = React.useRef(null);

  React.useEffect(() => {
    const auth = getAuth(app);
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);


  React.useEffect(() => {
    if (!user || !user.email) return;

    const q = query(collection(db, "supportRequests"), where("email", "==", user.email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ticketsData: SupportRequest[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate()?.toISOString() ?? new Date().toISOString(),
              resolvedAt: data.resolvedAt?.toDate()?.toISOString(),
          } as SupportRequest
      });

      setAllTickets(ticketsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reports data: ", error);
      toast({
        variant: "destructive",
        title: "Error de Carga",
        description: "No se pudieron cargar los datos para los reportes."
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  React.useEffect(() => {
    let ticketsToProcess = allTickets;
    if (selectedDate) {
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);
      ticketsToProcess = allTickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return isWithinInterval(ticketDate, { start, end });
      });
    }

    setFilteredTickets(ticketsToProcess);

    // Process data for charts and stats
    const statusCount: { [key: string]: number } = {};
    const incidentCount: { [key: string]: number } = {};
    let resolvedCount = 0;

    ticketsToProcess.forEach((ticket) => {
        const status = ticket.status || 'Sin Estado';
        statusCount[status] = (statusCount[status] || 0) + 1;
        
        if (ticket.tipo_incidente) {
            incidentCount[ticket.tipo_incidente] = (incidentCount[ticket.tipo_incidente] || 0) + 1;
        }
        if (ticket.status === 'Resuelto') {
            resolvedCount++;
        }
    });

    const formattedStatusData = Object.entries(statusCount).map(([name, count]) => ({ name, count }));
    const formattedIncidentData = Object.entries(incidentCount).map(([name, count]) => ({ name, count }));

    setTicketStatusData(formattedStatusData);
    setIncidentTypeData(formattedIncidentData.sort((a,b) => b.count - a.count));
    setStats({
        total: ticketsToProcess.length,
        resolved: resolvedCount,
        satisfaction: '4.8/5', // Placeholder
        avgResolutionTime: '2.5 horas' // Placeholder
    });

  }, [allTickets, selectedDate]);
  
  const handleExport = async (formatType: 'pdf' | 'excel') => {
    if (filteredTickets.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Sin datos',
            description: 'No hay tickets para exportar en el rango de fechas seleccionado.'
        });
        return;
    }
    
    setIsExporting(true);

    const tableData = filteredTickets.map(ticket => [
        ticket.id.substring(0, 6),
        ticket.tipo_incidente || 'N/A',
        ticket.status,
        ticket.assignedTo || 'Sin Asignar',
        format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm"),
        ticket.resolvedAt ? format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm") : 'N/A',
    ]);
    const tableHeaders = ["ID", "Incidente", "Estado", "Técnico Asignado", "Fecha Creación", "Fecha Resolución"];

    if (formatType === 'pdf') {
        const doc = new jsPDF({ orientation: 'portrait' });
        const reportTitle = selectedDate 
            ? `Reporte de Actividades - ${format(selectedDate, 'PPP', { locale: es })}`
            : 'Reporte General de Actividades de Soporte';
        
        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: 20,
            didDrawPage: (data) => {
                doc.setFontSize(18);
                doc.text(reportTitle, data.settings.margin.left, 15);
            },
            styles: { fontSize: 10 },
            headStyles: { fillColor: [38, 50, 56] }
        });
        
        // Add charts
        if (statusChartRef.current && incidentChartRef.current && (ticketStatusData.length > 0 || incidentTypeData.length > 0)) {
            try {
                doc.addPage();
                doc.setFontSize(18);
                doc.text("Resumen Gráfico", 14, 15);

                const statusCanvas = await html2canvas(statusChartRef.current, { scale: 2 });
                const incidentCanvas = await html2canvas(incidentChartRef.current, { scale: 2 });
                
                const statusImgData = statusCanvas.toDataURL('image/png');
                const incidentImgData = incidentCanvas.toDataURL('image/png');

                const pdfWidth = doc.internal.pageSize.getWidth();
                const chartWidth = pdfWidth - 28;
                
                const statusAspectRatio = statusCanvas.height / statusCanvas.width;
                const statusHeight = chartWidth * statusAspectRatio;
                const incidentAspectRatio = incidentCanvas.height / incidentCanvas.width;
                const incidentHeight = chartWidth * incidentAspectRatio;

                if (ticketStatusData.length > 0) {
                    doc.addImage(statusImgData, 'PNG', 14, 30, chartWidth, statusHeight);
                }
                if (incidentTypeData.length > 0) {
                    doc.addImage(incidentImgData, 'PNG', 14, 30 + statusHeight + 15, chartWidth, incidentHeight);
                }
            } catch (error) {
                console.error("Error generating chart images for PDF:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error de Gráficos',
                    description: 'No se pudieron añadir los gráficos al PDF.'
                })
            }
        }

        doc.save(`mi_reporte_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    }

    if (formatType === 'excel') {
        const worksheetData = filteredTickets.map(ticket => ({
            "ID Ticket": ticket.id.substring(0, 6),
            "Cliente": ticket.name,
            "Email": ticket.email,
            "Institución": ticket.institucion || 'N/A',
            "Ciudad": ticket.ciudad || 'N/A',
            "Tipo de Incidente": ticket.tipo_incidente || 'N/A',
            "Descripción Original": ticket.description,
            "Prioridad": ticket.priority,
            "Estado": ticket.status,
            "Técnico Asignado": ticket.assignedTo || 'Sin Asignar',
            "Fecha Creación": format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm"),
            "Fecha Resolución": ticket.resolvedAt ? format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm") : 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Mis Tickets");
        
        const colWidths = Object.keys(worksheetData[0] || {}).map(key => ({
             wch: Math.max(...worksheetData.map(row => (row[key as keyof typeof row] || '').toString().length), key.length) + 2
        }));
        worksheet["!cols"] = colWidths;

        XLSX.writeFile(workbook, `mi_reporte_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    }

    setIsExporting(false);
    toast({
        title: "Exportación Exitosa",
        description: `Tu reporte se ha generado en formato ${formatType.toUpperCase()}.`,
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold">Mis Reportes de Servicio</h1>
            <p className="text-muted-foreground">Filtra por fecha para ver reportes diarios o visualiza tu historial completo.</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={es}
                    disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                />
                </PopoverContent>
            </Popover>
            {selectedDate && (
                <Button variant="ghost" onClick={() => setSelectedDate(undefined)}>Limpiar Filtro</Button>
            )}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button disabled={isExporting}>
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Exportar Reporte
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('excel')} disabled={isExporting}>
                        Exportar a Excel (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
                        Exportar a PDF con Gráficos
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Tickets en Periodo</CardTitle>
            <CardDescription className="text-xs">{selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Total histórico'}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tickets Resueltos</CardTitle>
             <CardDescription className="text-xs">{selectedDate ? 'En la fecha seleccionada' : 'Total histórico'}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.resolved}</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Tasa de Resolución</CardTitle>
             <CardDescription className="text-xs">Del periodo seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total > 0 ? `${((stats.resolved / stats.total) * 100).toFixed(1)}%` : 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nivel de Satisfacción</CardTitle>
             <CardDescription className="text-xs">Próximamente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.satisfaction}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card ref={statusChartRef}>
          <CardHeader>
            <CardTitle>Mis Tickets por Estado</CardTitle>
            <CardDescription>Distribución de tickets para el periodo seleccionado.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-muted-foreground text-center py-12">Cargando datos...</p> : (
              ticketStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ticketStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {ticketStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Tickets"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center py-12">No hay datos para el periodo seleccionado.</p>
            )}
          </CardContent>
        </Card>
        <Card ref={incidentChartRef}>
          <CardHeader>
            <CardTitle>Mis Incidentes Más Comunes</CardTitle>
             <CardDescription>Problemas más frecuentes en el periodo seleccionado.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-muted-foreground text-center py-12">Cargando datos...</p> : (
              incidentTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentTypeData} layout="vertical" margin={{ left: 25, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={110} />
                    <Tooltip formatter={(value) => [value, "Tickets"]} />
                    <Legend />
                    <Bar dataKey="count" name="Número de Tickets" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center py-12">No hay datos para el periodo seleccionado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
