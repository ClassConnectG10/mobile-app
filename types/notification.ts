export class Notification {
  constructor(
    public id: number,
    public title: string,
    public body: string,
    public date: Date,
    public read: boolean = false,
  ) {}
}

export enum NotificationEvent {
  WELCOME = "WELCOME",
  USER_BLOCKED = "USER_BLOCKED",
  USER_UNBLOCKED = "USER_UNBLOCKED",
  STUDENT_ENROLLED = "STUDENT_ENROLLED",
  ACTIVITY_DELIVERY = "ACTIVITY_DELIVERY",
  AUXILIAR_ADDED = "AUXILIAR_ADDED",
  AUXILIAR_REMOVED = "AUXILIAR_REMOVED",
  ACTIVITY_PUBLISHED = "ACTIVITY_PUBLISHED",
  ACTIVITY_GRADED = "ACTIVITY_GRADED",
  COURSE_GRADE = "COURSE_GRADE",
  RESOURCE_PUBLISHED = "RESOURCE_PUBLISHED",
  STUDENT_KICKED = "STUDENT_KICKED",
}

export enum NotificationLevel {
  ALTO = "ALTO",
  BAJO = "BAJO",
}

export enum NotificationAudience {
  GENERAL = "GENERAL",
  ALUMNO = "ALUMNO",
  DOCENTE = "DOCENTE",
  AUXILIAR = "AUXILIAR",
}

export enum NotificationConfig {
  CONFIGURABLE = "CONFIGURABLE",
  NO_CONFIGURABLE = "NO_CONFIGURABLE",
}

export interface NotificationEventMeta {
  event: NotificationEvent;
  icon: string;
  displayName: string;
  level: NotificationLevel;
  audience: NotificationAudience;
  configurable: NotificationConfig;
}

export const notificationEventMeta: Record<
  NotificationEvent,
  NotificationEventMeta
> = {
  [NotificationEvent.WELCOME]: {
    event: NotificationEvent.WELCOME,
    icon: "human-greeting-variant",
    displayName: "Bienvenida",
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.GENERAL,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.USER_BLOCKED]: {
    event: NotificationEvent.USER_BLOCKED,
    icon: "account-off",
    displayName: "Usuario Bloqueado",
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.GENERAL,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.USER_UNBLOCKED]: {
    event: NotificationEvent.USER_UNBLOCKED,
    icon: "account-check",
    displayName: "Usuario Desbloqueado",
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.GENERAL,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.STUDENT_ENROLLED]: {
    event: NotificationEvent.STUDENT_ENROLLED,
    icon: "account-plus",
    displayName: "Estudiante Inscrito",
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.DOCENTE,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.ACTIVITY_DELIVERY]: {
    event: NotificationEvent.ACTIVITY_DELIVERY,
    icon: "file-upload",
    displayName: "Entrega de Actividad",
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.DOCENTE,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.AUXILIAR_ADDED]: {
    event: NotificationEvent.AUXILIAR_ADDED,
    icon: "account-plus",
    displayName: "Auxiliar Agregado",
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.AUXILIAR,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.AUXILIAR_REMOVED]: {
    event: NotificationEvent.AUXILIAR_REMOVED,
    icon: "account-minus",
    displayName: "Auxiliar Removido",
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.AUXILIAR,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.ACTIVITY_PUBLISHED]: {
    event: NotificationEvent.ACTIVITY_PUBLISHED,
    icon: "file-document",
    displayName: "Actividad Publicada",
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.ACTIVITY_GRADED]: {
    event: NotificationEvent.ACTIVITY_GRADED,
    icon: "check-circle",
    displayName: "Actividad Calificada",
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.COURSE_GRADE]: {
    event: NotificationEvent.COURSE_GRADE,
    icon: "star",
    displayName: "Calificación del Curso",
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.RESOURCE_PUBLISHED]: {
    event: NotificationEvent.RESOURCE_PUBLISHED,
    icon: "folder-upload",
    displayName: "Recurso Publicado",
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.STUDENT_KICKED]: {
    event: NotificationEvent.STUDENT_KICKED,
    icon: "account-remove",
    displayName: "Estudiante Expulsado",
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
};
