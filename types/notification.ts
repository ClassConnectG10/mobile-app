import { BiMap } from "@/utils/bimap";

export class Notification {
  constructor(
    public id: string,
    public title: string,
    public body: string,
    public date: Date,
  ) { }
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
  AUTOCORRECTION_COMPLETED = "AUTOCORRECTION_COMPLETED",
  FEEDBACK_REGISTERED = "FEEDBACK_REGISTERED",
  FORUM_QUESTION = "FORUM_QUESTION",
  FORUM_ANSWER = "FORUM_ANSWER",
  FORUM_THREAD_ANSWER = "FORUM_THREAD_ANSWER",
  FORUM_ANSWER_ACCEPTED = "FORUM_ANSWER_ACCEPTED",
  FORUM_ANSWER_VOTE = "FORUM_ANSWER_VOTE",
}

export const notificationEventBiMap = new BiMap([
  ["Usuario Bloqueado", NotificationEvent.USER_BLOCKED],
  ["Usuario Desbloqueado", NotificationEvent.USER_UNBLOCKED],
  ["Estudiante Inscrito", NotificationEvent.STUDENT_ENROLLED],
  ["Entrega de Actividad", NotificationEvent.ACTIVITY_DELIVERY],
  ["Auxiliar Agregado", NotificationEvent.AUXILIAR_ADDED],
  ["Auxiliar Removido", NotificationEvent.AUXILIAR_REMOVED],
  ["Inscripción a curso", NotificationEvent.WELCOME],
  ["Actividad Publicada", NotificationEvent.ACTIVITY_PUBLISHED],
  ["Actividad Calificada", NotificationEvent.ACTIVITY_GRADED],
  ["Calificación del Curso", NotificationEvent.COURSE_GRADE],
  ["Recurso Publicado", NotificationEvent.RESOURCE_PUBLISHED],
  ["Estudiante Expulsado", NotificationEvent.STUDENT_KICKED],
  [
    "Corrección Automática Completada",
    NotificationEvent.AUTOCORRECTION_COMPLETED,
  ],
  ["Reseña de Curso Enviada", NotificationEvent.FEEDBACK_REGISTERED],
  ["Nueva Pregunta en Foro", NotificationEvent.FORUM_QUESTION],
  ["Nueva Respuesta en Foro", NotificationEvent.FORUM_ANSWER],
  ["Nueva Respuesta en Hilo de Foro", NotificationEvent.FORUM_THREAD_ANSWER],
  ["Respuesta Aceptada en Foro", NotificationEvent.FORUM_ANSWER_ACCEPTED],
  ["Voto en Respuesta de Foro", NotificationEvent.FORUM_ANSWER_VOTE],
]);

export const notificationEventIconBiMap = new BiMap([
  ["human-greeting-variant", NotificationEvent.WELCOME],
  ["account-off", NotificationEvent.USER_BLOCKED],
  ["account-check", NotificationEvent.USER_UNBLOCKED],
  ["account-plus", NotificationEvent.STUDENT_ENROLLED],
  ["file-upload", NotificationEvent.ACTIVITY_DELIVERY],
  ["account-multiple", NotificationEvent.AUXILIAR_ADDED],
  ["account-minus", NotificationEvent.AUXILIAR_REMOVED],
  ["file-document", NotificationEvent.ACTIVITY_PUBLISHED],
  ["check-circle", NotificationEvent.ACTIVITY_GRADED],
  ["star", NotificationEvent.COURSE_GRADE],
  ["folder-upload", NotificationEvent.RESOURCE_PUBLISHED],
  ["account-remove", NotificationEvent.STUDENT_KICKED],
  ["robot", NotificationEvent.AUTOCORRECTION_COMPLETED],
  ["star-plus", NotificationEvent.FEEDBACK_REGISTERED],
  ["forum", NotificationEvent.FORUM_QUESTION],
  ["comment-plus", NotificationEvent.FORUM_ANSWER],
  ["comment-multiple", NotificationEvent.FORUM_THREAD_ANSWER],
  ["check-bold", NotificationEvent.FORUM_ANSWER_ACCEPTED],
  ["thumb-up", NotificationEvent.FORUM_ANSWER_VOTE],
]);

export enum NotificationAudience {
  GENERAL = "GENERAL",
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ASSISTANT = "ASSISTANT",
  FORUM = "FORUM",
}

export const notificationAudienceBiMap = new BiMap([
  ["General", NotificationAudience.GENERAL],
  ["Alumno", NotificationAudience.STUDENT],
  ["Docente", NotificationAudience.TEACHER],
  ["Auxiliar", NotificationAudience.ASSISTANT],
  ["Foro", NotificationAudience.FORUM],
]);

export enum NotificationConfig {
  CONFIGURABLE = "CONFIGURABLE",
  NO_CONFIGURABLE = "NO_CONFIGURABLE",
}

export interface NotificationEventMeta {
  event: NotificationEvent;
  audience: NotificationAudience;
  configurable: NotificationConfig;
}

export const notificationEventMeta: NotificationEventMeta[] = [
  {
    event: NotificationEvent.USER_BLOCKED,
    audience: NotificationAudience.GENERAL,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  {
    event: NotificationEvent.USER_UNBLOCKED,
    audience: NotificationAudience.GENERAL,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  {
    event: NotificationEvent.STUDENT_ENROLLED,
    audience: NotificationAudience.TEACHER,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.ACTIVITY_DELIVERY,
    audience: NotificationAudience.TEACHER,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.AUXILIAR_ADDED,
    audience: NotificationAudience.ASSISTANT,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  {
    event: NotificationEvent.AUXILIAR_REMOVED,
    audience: NotificationAudience.ASSISTANT,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  {
    event: NotificationEvent.WELCOME,
    audience: NotificationAudience.STUDENT,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  {
    event: NotificationEvent.ACTIVITY_PUBLISHED,
    audience: NotificationAudience.STUDENT,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.ACTIVITY_GRADED,
    audience: NotificationAudience.STUDENT,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.COURSE_GRADE,
    audience: NotificationAudience.STUDENT,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.RESOURCE_PUBLISHED,
    audience: NotificationAudience.STUDENT,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.STUDENT_KICKED,
    audience: NotificationAudience.STUDENT,
    configurable: NotificationConfig.NO_CONFIGURABLE,
  },
  {
    event: NotificationEvent.AUTOCORRECTION_COMPLETED,
    audience: NotificationAudience.TEACHER,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.FEEDBACK_REGISTERED,
    audience: NotificationAudience.STUDENT,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.FORUM_QUESTION,
    audience: NotificationAudience.FORUM,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.FORUM_ANSWER,
    audience: NotificationAudience.FORUM,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.FORUM_THREAD_ANSWER,
    audience: NotificationAudience.FORUM,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.FORUM_ANSWER_ACCEPTED,
    audience: NotificationAudience.FORUM,
    configurable: NotificationConfig.CONFIGURABLE,
  },
  {
    event: NotificationEvent.FORUM_ANSWER_VOTE,
    audience: NotificationAudience.FORUM,
    configurable: NotificationConfig.CONFIGURABLE,
  },
];
