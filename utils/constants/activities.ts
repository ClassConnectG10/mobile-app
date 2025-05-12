import {
  Activity,
  ActivityStatus,
  ActivityType,
  ActiviyDetails,
  StudentActivity,
  TeacherActivity,
} from "@/types/activity";

export const TEACHER_ACTIVITIES: TeacherActivity[] = [
  new TeacherActivity(
    new Activity(
      1,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 1",
        "Descripción de la tarea 1",
        "Seguí las instrucciones del PDF.",
        new Date(Date.now() - 1000 * 60 * 60 * 24)
      )
    ),
    true
  ),
  new TeacherActivity(
    new Activity(
      2,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 2",
        "Descripción de la tarea 2",
        "Entregar por la plataforma.",
        new Date(Date.now() + 1000 * 60 * 60 * 24)
      )
    ),
    false
  ),
  new TeacherActivity(
    new Activity(
      3,
      ActivityType.EXAM,
      new ActiviyDetails(
        "Examen 1",
        "Descripción de la tarea 3",
        "Leer el material de apoyo.",
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
      )
    ),
    true
  ),
  new TeacherActivity(
    new Activity(
      4,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 4",
        "Descripción de la tarea 4",
        "Resolver los ejercicios del documento.",
        new Date(Date.now() + 1000 * 60 * 5)
      )
    ),
    true
  ),
  new TeacherActivity(
    new Activity(
      5,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 5",
        "Descripción de la tarea 5",
        "Subir un archivo con las respuestas.",
        new Date(Date.now() + 1000 * 10)
      )
    ),
    false
  ),
];

export const STUDENT_ACTIVITIES: StudentActivity[] = [
  new StudentActivity(
    new Activity(
      1,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 1",
        "Descripción de la tarea 1",
        "Seguí las instrucciones del PDF.",
        new Date(Date.now() - 1000 * 60 * 60 * 24)
      )
    ),
    ActivityStatus.PENDING
  ),
  new StudentActivity(
    new Activity(
      2,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 2",
        "Descripción de la tarea 2",
        "Entregar por la plataforma.",
        new Date(Date.now() + 1000 * 60 * 60 * 24)
      )
    ),
    ActivityStatus.COMPLETED
  ),
  new StudentActivity(
    new Activity(
      3,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 3",
        "Descripción de la tarea 3",
        "Leer el material de apoyo.",
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
      )
    ),
    ActivityStatus.PENDING
  ),
  new StudentActivity(
    new Activity(
      4,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 4",
        "Descripción de la tarea 4",
        "Resolver los ejercicios del documento.",
        new Date(Date.now() + 1000 * 60 * 5)
      )
    ),
    ActivityStatus.COMPLETED
  ),
  new StudentActivity(
    new Activity(
      5,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 5",
        "Descripción de la tarea 5",
        "Subir un archivo con las respuestas.",
        new Date(Date.now() + 1000 * 30)
      )
    ),
    ActivityStatus.IN_PROGRESS
  ),
  new StudentActivity(
    new Activity(
      6,
      ActivityType.TASK,
      new ActiviyDetails(
        "Tarea 6",
        "Descripción de la tarea 6",
        "Subir un archivo con las respuestas.",
        new Date(Date.now() + 1000 * 10 * 40 * 5)
      )
    ),
    ActivityStatus.IN_PROGRESS
  ),
];
