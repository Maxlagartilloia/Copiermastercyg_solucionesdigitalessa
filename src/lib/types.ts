

export type RequestType = 'Consulta de Ventas' | 'Soporte Técnico';
export type RequestStatus = 'Abierto' | 'En Progreso' | 'En Espera' | 'Resuelto' | 'Cerrado';
export type AssignedTo = string;
export type Priority = 'Baja' | 'Media' | 'Alta' | 'Urgente';
export type IncidentType = 'Error de Impresión' | 'Atasco de Papel' | 'Problema de Calidad' | 'Consumibles' | 'Conectividad' | 'Configuración' | 'Otro';
export type ResolutionAction = 'Reparado sin repuestos' | 'Repuestos cambiados' | 'Equipo reubicado' | 'Equipo reemplazado' | 'Capacitación a usuario' | 'Configuración remota' | 'Otro';

export interface SupportRequest {
  id: string;
  name: string;
  email: string;
  requestType: RequestType;
  description: string;
  status: RequestStatus;
  assignedTo: AssignedTo;
  createdAt: string;
  priority: Priority;
  asunto?: string;
  impresora_id?: string;
  institucion?: string;
  ciudad?: string;
  tipo_incidente?: IncidentType;
  resolution_details?: string;
  resolution_action?: ResolutionAction;
  resolution_parts?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  pending_activities?: string;
  observations?: string;
}

export interface Technician {
    id: string;
    name: string;
    email: string;
    specialty: string;
    city: string;
}

export interface Client {
    id: string;
    name: string;
    city: string;
    contact_person?: string;
    phone?: string;
}

export interface UserRegistrationRequest {
    id: string;
    uid: string; // The Firebase Auth User ID
    name: string;
    email: string;
    company: string;
    ruc: string;
    phone: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}
    