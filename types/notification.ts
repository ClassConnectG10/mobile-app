import { BiMap } from "@/utils/bimap";

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

export const notificationEventBiMap = new BiMap([
  ["Bienvenida", NotificationEvent.WELCOME],
  ["Usuario Bloqueado", NotificationEvent.USER_BLOCKED],
  ["Usuario Desbloqueado", NotificationEvent.USER_UNBLOCKED],
  ["Estudiante Inscrito", NotificationEvent.STUDENT_ENROLLED],
  ["Entrega de Actividad", NotificationEvent.ACTIVITY_DELIVERY],
  ["Auxiliar Agregado", NotificationEvent.AUXILIAR_ADDED],
  ["Auxiliar Removido", NotificationEvent.AUXILIAR_REMOVED],
  ["Actividad Publicada", NotificationEvent.ACTIVITY_PUBLISHED],
  ["Actividad Calificada", NotificationEvent.ACTIVITY_GRADED],
  ["Calificación del Curso", NotificationEvent.COURSE_GRADE],
  ["Recurso Publicado", NotificationEvent.RESOURCE_PUBLISHED],
  ["Estudiante Expulsado", NotificationEvent.STUDENT_KICKED],
]);

export const notificationEventIconBiMap = new BiMap([
  ["human-greeting-variant", NotificationEvent.WELCOME],
  ["account-off", NotificationEvent.USER_BLOCKED],
  ["account-check", NotificationEvent.USER_UNBLOCKED],
  ["account-plus", NotificationEvent.STUDENT_ENROLLED],
  ["file-upload", NotificationEvent.ACTIVITY_DELIVERY],
  ["account-plus", NotificationEvent.AUXILIAR_ADDED],
  ["account-minus", NotificationEvent.AUXILIAR_REMOVED],
  ["file-document", NotificationEvent.ACTIVITY_PUBLISHED],
  ["check-circle", NotificationEvent.ACTIVITY_GRADED],
  ["star", NotificationEvent.COURSE_GRADE],
  ["folder-upload", NotificationEvent.RESOURCE_PUBLISHED],
  ["account-remove", NotificationEvent.STUDENT_KICKED],
]);

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

export const notificationAudienceBiMap = new BiMap([
  ["General", NotificationAudience.GENERAL],
  ["Alumno", NotificationAudience.ALUMNO],
  ["Docente", NotificationAudience.DOCENTE],
  ["Auxiliar", NotificationAudience.AUXILIAR],
]);

export enum NotificationConfig {
  CONFIGURABLE = "CONFIGURABLE",
  NO_CONFIGURABLE = "NO_CONFIGURABLE",
}

export interface NotificationEventMeta {
  event: NotificationEvent;
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
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.GENERAL,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.USER_BLOCKED]: {
    event: NotificationEvent.USER_BLOCKED,
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.GENERAL,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.USER_UNBLOCKED]: {
    event: NotificationEvent.USER_UNBLOCKED,
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.GENERAL,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.STUDENT_ENROLLED]: {
    event: NotificationEvent.STUDENT_ENROLLED,
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.DOCENTE,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.ACTIVITY_DELIVERY]: {
    event: NotificationEvent.ACTIVITY_DELIVERY,
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.DOCENTE,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.AUXILIAR_ADDED]: {
    event: NotificationEvent.AUXILIAR_ADDED,
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.AUXILIAR,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.AUXILIAR_REMOVED]: {
    event: NotificationEvent.AUXILIAR_REMOVED,
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.AUXILIAR,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  [NotificationEvent.ACTIVITY_PUBLISHED]: {
    event: NotificationEvent.ACTIVITY_PUBLISHED,
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.ACTIVITY_GRADED]: {
    event: NotificationEvent.ACTIVITY_GRADED,
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.COURSE_GRADE]: {
    event: NotificationEvent.COURSE_GRADE,
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.RESOURCE_PUBLISHED]: {
    event: NotificationEvent.RESOURCE_PUBLISHED,
    level: NotificationLevel.BAJO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  [NotificationEvent.STUDENT_KICKED]: {
    event: NotificationEvent.STUDENT_KICKED,
    level: NotificationLevel.ALTO,
    audience: NotificationAudience.ALUMNO,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
};
