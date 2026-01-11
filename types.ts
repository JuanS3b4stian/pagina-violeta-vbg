
export enum UserRole {
  ADMIN1 = 'admin1', // Coordinador de Equidad de Género
  ADMIN2 = 'admin2', // Secretaría de Gobierno
  DESPACHO = 'despachos' // Vista operativa
}

export enum CaseStatus {
  PENDIENTE = 'Pendiente',
  ASIGNADO = 'Asignado',
  EN_GESTION = 'En Gestión',
  RECLASIFICACION_SOLICITADA = 'Reclasificación Solicitada',
  RECLASIFICACION_PENDIENTE_ADMIN2 = 'Pendiente Decisión Sec. Gobierno',
  CONFLICTO = 'Conflicto de Competencia',
  CERRADO = 'Cerrado'
}

export enum UrgencyLevel {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
  CRITICA = 'Crítica'
}

export interface CaseActivity {
  id: string;
  date: string;
  user: string;
  description: string;
  attachmentUrl?: string;
}

export interface CaseRecord {
  id: string;
  fecha: string;
  municipio: string;
  profesionalAtendio: string;
  
  // Remitente
  remitenteNombre: string;
  remitenteCargo: string;
  remitenteCorreo: string;
  remitenteTelefono: string;
  
  // Datos Usuaria
  usuariaNombre: string;
  usuariaCedula: string;
  usuariaNacionalidad: string;
  usuariaEdad: string;
  usuariaTelefono: string;
  usuariaMunicipio: string;
  
  // Detalles Caso
  derechoInvolucrado: string;
  tipoViolencia: string;
  descripcionBreve: string;
  accionesEmprendidas: string;
  observaciones: string;
  
  // Gestión Interna
  urgencia: UrgencyLevel;
  estado: CaseStatus;
  despachoAsignado: string;
  historial: CaseActivity[];
  
  // Enlaces Documentales
  adjuntoOriginalUrl?: string;
  expedientePdfUrl?: string;
  solicitudReclasificacionUrl?: string;
  analisisAdmin1Url?: string;
  decisionFinalUrl?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  officeName?: string;
  email: string;
}
