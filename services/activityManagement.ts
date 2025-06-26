import {
  TeacherActivity,
  Activity,
  TaskDetails,
  StudentActivity,
  ActivitiesOption,
  ActivityType,
  ExamDetails,
  ExamSubmission,
  SubmittedExamItem,
  ExamItem,
  TaskSubmission,
  TaskGrade,
  ExamGrade,
  ActivitySubmission,
  ExamAutocorrection,
  AutocorrectionStatus,
  ExamItemAutocorrection,
  CORRECT_AUTOCORRECTED_ANSWER,
} from "@/types/activity";
import {
  examItemToJSON,
  getExamAnswerFromJSON,
  getExamItemFromJSON,
  getFileFromBackend,
  handleError,
  postFile,
  submittedExamItemToJSON,
} from "./common";
import {
  createActivityRequest,
  createActivitySubmissionsRequest,
  createActivitySubmissionRequest,
  createExamsRequest,
  createTasksRequest,
  createActivitiesRequest,
  createExamRequest,
  createTaskRequest,
  createUploadTaskFileRequest,
  createSubmitTaskRequest,
  createSubmitExamRequest,
  createPublishTaskRequest,
  createPublishExamRequest,
  createGradeSubmissionRequest,
  createGetSubmissionsByStudentRequest,
  createDeleteTaskFileRequest,
  createAutocorrectExamRequest,
  createGetExamAutocorrectionRequest,
} from "@/api/activities";
import {
  activityDetailsSchema,
  activityDetailsSchemaUpdate,
  examDetailsSchema,
  examGradeSchema,
  submittedExamItemSchema,
  taskGradeSchema,
} from "@/validations/activities";
import { getDateFromBackend } from "./common";
import { File } from "@/types/file";

// ACTIVITIES

export async function getCourseTeacherActivities(
  courseId: string,
  activitiesOption: ActivitiesOption
): Promise<TeacherActivity[]> {
  try {
    const request = await createActivitiesRequest(courseId, activitiesOption);
    const response = await request.get("");

    const activitiesData = response.data.data;

    const activities: TeacherActivity[] = activitiesData.map(
      (activityData: any) => {
        if (activityData.type === ActivityType.TASK) {
          return new TeacherActivity(
            new Activity(
              activityData.resource_id,
              activityData.module_id,
              activityData.type,
              new TaskDetails(
                activityData.module_id,
                activityData.title,
                activityData.instruction,
                null,
                getDateFromBackend(activityData.due_date)
              )
            ),
            activityData.visible
          );
        } else if (activityData.type === ActivityType.EXAM) {
          return new TeacherActivity(
            new Activity(
              activityData.resource_id,
              activityData.module_id,
              activityData.type,
              new ExamDetails(
                activityData.module_id,
                activityData.title,
                activityData.instruction,
                [],
                getDateFromBackend(activityData.due_date)
              )
            ),
            activityData.visible
          );
        }
      }
    );

    return activities;
  } catch (error) {
    throw handleError(error, "obtener las actividades del curso");
  }
}

export async function getCourseStudentActivities(
  courseId: string,
  activitiesOption: ActivitiesOption
): Promise<StudentActivity[]> {
  try {
    const request = await createActivitiesRequest(courseId, activitiesOption);
    const response = await request.get("");

    const activitiesData = response.data.data;
    const activities: StudentActivity[] = activitiesData.map(
      (activityData: any) => {
        if (activityData.type === ActivityType.TASK) {
          return new StudentActivity(
            new Activity(
              activityData.resource_id,
              activityData.module_id,
              activityData.type,
              new TaskDetails(
                activityData.module_id,
                activityData.title,
                activityData.instruction,
                getFileFromBackend(activityData.external_ref, activityData.url),
                getDateFromBackend(activityData.due_date)
              )
            ),
            activityData.delivered,
            activityData.delivered_date
              ? getDateFromBackend(activityData.delivered_date)
              : null
          );
        } else if (activityData.type === ActivityType.EXAM) {
          return new StudentActivity(
            new Activity(
              activityData.resource_id,
              activityData.module_id,
              activityData.type,
              new ExamDetails(
                activityData.module_id,
                activityData.title,
                activityData.instruction,
                [],
                getDateFromBackend(activityData.due_date)
              )
            ),
            activityData.delivered,
            activityData.delivered_date
              ? getDateFromBackend(activityData.delivered_date)
              : null
          );
        }
      }
    );

    return activities;
  } catch (error) {
    throw handleError(error, "obtener las actividades del curso");
  }
}

export async function getModuleTeacherActivities(
  courseId: string,
  moduleId: number
): Promise<TeacherActivity[]> {
  try {
    const activities = await getCourseTeacherActivities(
      courseId,
      ActivitiesOption.ALL
    );
    return activities.filter(
      (activity) => activity.activity.moduleId === moduleId
    );
  } catch (error) {
    throw handleError(error, "obtener las actividades del curso");
  }
}

export async function getModuleStudentActivities(
  courseId: string,
  moduleId: number
): Promise<StudentActivity[]> {
  try {
    const activities = await getCourseStudentActivities(
      courseId,
      ActivitiesOption.ALL
    );
    return activities.filter(
      (activity) => activity.activity.moduleId === moduleId
    );
  } catch (error) {
    throw handleError(error, "obtener las actividades del módulo");
  }
}

export async function getTeacherTask(
  courseId: string,
  taskId: number
): Promise<TeacherActivity> {
  try {
    const request = await createActivityRequest(courseId, taskId);
    const response = await request.get("");

    const activityData = response.data.data;
    const activity: TeacherActivity = new TeacherActivity(
      new Activity(
        activityData.resource_id,
        activityData.module_id,
        activityData.type,
        new TaskDetails(
          activityData.module_id,
          activityData.title,
          activityData.instruction,
          getFileFromBackend(activityData.external_ref, activityData.url),
          getDateFromBackend(activityData.due_date)
        )
      ),
      activityData.visible
    );

    return activity;
  } catch (error) {
    throw handleError(error, "obtener la actividad del profesor");
  }
}

export async function getStudentTask(
  courseId: string,
  taskId: number
): Promise<StudentActivity> {
  try {
    const request = await createActivityRequest(courseId, taskId);
    const response = await request.get("");
    const activityData = response.data.data;
    const activity = new StudentActivity(
      new Activity(
        activityData.resource_id,
        activityData.module_id,
        activityData.type,
        new TaskDetails(
          activityData.module_id,
          activityData.title,
          activityData.instruction,
          getFileFromBackend(activityData.external_ref, activityData.url),
          getDateFromBackend(activityData.due_date)
        )
      ),
      activityData.delivered,
      activityData.delivered_date
        ? getDateFromBackend(activityData.delivered_date)
        : null
    );

    return activity;
  } catch (error) {
    throw handleError(error, "obtener la actividad del estudiante");
  }
}

export async function getTeacherExam(
  courseId: string,
  examId: number
): Promise<TeacherActivity> {
  try {
    const request = await createActivityRequest(courseId, examId);
    const response = await request.get("");

    const activityData = response.data.data;
    const activity: TeacherActivity = new TeacherActivity(
      new Activity(
        activityData.resource_id,
        activityData.module_id,
        ActivityType.EXAM,
        new ExamDetails(
          activityData.module_id,
          activityData.title,
          activityData.instruction,
          activityData.exam_fields.map((item: any) =>
            getExamItemFromJSON(item)
          ),
          getDateFromBackend(activityData.due_date)
        )
      ),
      activityData.visible
    );

    return activity;
  } catch (error) {
    throw handleError(error, "obtener la actividad del profesor");
  }
}

export async function getStudentExam(
  courseId: string,
  examId: number
): Promise<StudentActivity> {
  try {
    const request = await createActivityRequest(courseId, examId);
    const response = await request.get("");
    const activityData = response.data.data;
    const activity = new StudentActivity(
      new Activity(
        activityData.resource_id,
        activityData.module_id,
        ActivityType.EXAM,
        new ExamDetails(
          activityData.module_id,
          activityData.title,
          activityData.instruction,
          activityData.exam_fields.map((item: any) =>
            getExamItemFromJSON(item)
          ),
          getDateFromBackend(activityData.due_date)
        )
      ),
      activityData.delivered,
      activityData.delivered_date
        ? getDateFromBackend(activityData.delivered_date)
        : null
    );
    return activity;
  } catch (error) {
    throw handleError(error, "obtener la actividad del estudiante");
  }
}

// SUBMISSIONS

export async function getTaskSubmissions(
  courseId: string,
  taskId: number
): Promise<TaskSubmission[]> {
  try {
    const request = await createActivitySubmissionsRequest(courseId, taskId);
    const response = await request.get("");
    const submissionsData = response.data.data;

    const submissions: [] = submissionsData.map((activityData: any) => {
      return new TaskSubmission(
        taskId,
        activityData.user_id,
        activityData.delivered,
        getDateFromBackend(activityData.due_date),
        activityData.delivered
          ? getFileFromBackend(activityData.external_ref, activityData.url)
          : null,
        activityData.delivered
          ? getDateFromBackend(activityData.delivered_date)
          : null
      );
    });
    return submissions;
  } catch (error) {
    throw handleError(error, "obtener las entregas de la actividad");
  }
}

export async function getExamSubmissions(
  courseId: string,
  examId: number,
  examItems: ExamItem[]
): Promise<ExamSubmission[]> {
  try {
    const request = await createActivitySubmissionsRequest(courseId, examId);
    const response = await request.get("");
    const submissionsData = response.data.data;

    const submissions: [] = submissionsData.map((activityData: any) => {
      return new ExamSubmission(
        examId,
        activityData.user_id,
        activityData.delivered
          ? examItems.map((item: any, index) =>
              getExamAnswerFromJSON(item, index, activityData)
            )
          : [],
        activityData.delivered,
        getDateFromBackend(activityData.due_date),
        activityData.delivered_date
          ? getDateFromBackend(activityData.delivered_date)
          : null
      );
    });
    return submissions;
  } catch (error) {
    throw handleError(error, "obtener las entregas de la actividad");
  }
}

export async function getTaskSubmission(
  courseId: string,
  taskId: number,
  studentId: number
): Promise<TaskSubmission> {
  try {
    const request = await createActivitySubmissionRequest(
      courseId,
      taskId,
      studentId
    );
    const response = await request.get("");
    const responseData = response.data.data;

    const taskSubmission = new TaskSubmission(
      taskId,
      studentId,
      responseData.delivered,
      getDateFromBackend(responseData.due_date),
      responseData.delivered
        ? getFileFromBackend(responseData.external_ref, responseData.url)
        : null,
      responseData.delivered_date
        ? getDateFromBackend(responseData.delivered_date)
        : null
    );

    return taskSubmission;
  } catch (error) {
    throw handleError(error, "obtener la entrega de la actividad");
  }
}

export async function getExamSubmission(
  courseId: string,
  examId: number,
  studentId: number,
  examItems: ExamItem[]
): Promise<ExamSubmission> {
  try {
    const request = await createActivitySubmissionRequest(
      courseId,
      examId,
      studentId
    );

    const response = await request.get("");
    const responseData = response.data.data;

    const examSubmission = new ExamSubmission(
      examId,
      studentId,
      examItems.map((item, index) =>
        getExamAnswerFromJSON(item, index, responseData)
      ),
      responseData.delivered,
      getDateFromBackend(responseData.due_date),
      responseData.delivered_date
        ? getDateFromBackend(responseData.delivered_date)
        : null
    );

    return examSubmission;
  } catch (error) {
    throw handleError(error, "obtener la entrega del examen");
  }
}

// ACTIONS

export async function createTask(
  courseId: string,
  taskDetails: TaskDetails
): Promise<void> {
  try {
    activityDetailsSchema.parse(taskDetails);

    const request = await createTasksRequest(courseId);

    const body = {
      title: taskDetails.title,
      description: "",
      instruction: taskDetails.instructions,
      due_date: taskDetails.dueDate.toISOString(),
      module: taskDetails.moduleId,
    };

    const response = await request.post("", body);
    const resource_id = response.data.data.resource_id;

    if (taskDetails.instructionsFile) {
      await uploadTaskFile(courseId, resource_id, taskDetails.instructionsFile);
    }
  } catch (error) {
    throw handleError(error, "crear la actividad");
  }
}

export async function createExam(
  courseId: string,
  examDetails: ExamDetails
): Promise<number> {
  try {
    examDetailsSchema.parse(examDetails);

    const request = await createExamsRequest(courseId);
    const body = {
      title: examDetails.title,
      description: "",
      instruction: examDetails.instructions,
      due_date: examDetails.dueDate.toISOString(),
      module: examDetails.moduleId,
      exam_fields: examDetails.examItems.map((item) => examItemToJSON(item)),
    };

    const response = await request.post("", body);
    return response.data.data.resource_id;
  } catch (error) {
    throw handleError(error, "crear el examen");
  }
}

export async function submitTask(
  courseId: string,
  taskId: number,
  file: File
): Promise<void> {
  try {
    const request = await createSubmitTaskRequest(courseId, taskId);
    if (file) {
      await postFile(request, file);
    }
  } catch (error) {
    throw handleError(error, "enviar la actividad");
  }
}

export async function submitExam(
  courseId: string,
  examId: number,
  examItems: SubmittedExamItem[]
): Promise<void> {
  try {
    examItems.forEach((item) => {
      submittedExamItemSchema.parse(item);
    });
    const request = await createSubmitExamRequest(courseId, examId);

    const body = {
      answers: examItems.map((item) => submittedExamItemToJSON(item)),
    };

    await request.post("", body);
  } catch (error) {
    throw handleError(error, "enviar el examen");
  }
}

export async function publishTask(
  courseId: string,
  taskId: number
): Promise<void> {
  try {
    let request = await createPublishTaskRequest(courseId, taskId);
    await request.post("");
  } catch (error) {
    throw handleError(error, "publicar la actividad");
  }
}

export async function publishExam(
  courseId: string,
  examId: number
): Promise<void> {
  try {
    let request = await createPublishExamRequest(courseId, examId);
    await request.post("");
  } catch (error) {
    throw handleError(error, "publicar el examen");
  }
}

export async function updateTask(
  courseId: string,
  taskId: number,
  taskDetails: TaskDetails,
  taskFileChanged: boolean
): Promise<void> {
  try {
    activityDetailsSchemaUpdate.parse(taskDetails);
    const request = await createTaskRequest(courseId, taskId);

    const body = {
      title: taskDetails.title,
      description: "",
      instruction: taskDetails.instructions,
      due_date: taskDetails.dueDate.toISOString(),
      // module: taskDetails.moduleId,
    };

    if (taskFileChanged) {
      if (taskDetails.instructionsFile) {
        await uploadTaskFile(courseId, taskId, taskDetails.instructionsFile);
      } else {
        await deleteTaskFile(courseId, taskId);
      }
    }

    await request.patch("", body);
  } catch (error) {
    throw handleError(error, "actualizar la actividad");
  }
}

export async function updateExam(
  courseId: string,
  examId: number,
  examDetails: ExamDetails
): Promise<void> {
  try {
    examDetailsSchema.parse(examDetails);

    const request = await createExamRequest(courseId, examId);
    const body = {
      title: examDetails.title,
      instruction: examDetails.instructions,
      due_date: examDetails.dueDate.toISOString(),
      // module: examDetails.moduleId,
      exam_fields: examDetails.examItems.map((item) => examItemToJSON(item)),
    };

    await request.patch("", body);
  } catch (error) {
    throw handleError(error, "actualizar el examen");
  }
}

export async function deleteTask(
  courseId: string,
  taskId: number
): Promise<void> {
  try {
    let request = await createTaskRequest(courseId, taskId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar la actividad");
  }
}

export async function deleteExam(
  courseId: string,
  examId: number
): Promise<void> {
  try {
    const request = await createExamRequest(courseId, examId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar el examen");
  }
}

export async function uploadTaskFile(
  courseId: string,
  taskId: number,
  file: File
): Promise<void> {
  try {
    const request = await createUploadTaskFileRequest(courseId, taskId);
    await postFile(request, file);
  } catch (error) {
    throw handleError(error, "subir el archivo de la actividad");
  }
}

export async function deleteTaskFile(
  courseId: string,
  taskId: number
): Promise<void> {
  try {
    const request = await createDeleteTaskFileRequest(courseId, taskId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar el archivo de la actividad");
  }
}

export async function gradeTask(
  courseId: string,
  taskGrade: TaskGrade
): Promise<void> {
  try {
    taskGradeSchema.parse(taskGrade);
    const request = await createGradeSubmissionRequest(
      courseId,
      taskGrade.resourceId,
      taskGrade.studentId
    );
    const body = {
      mark: taskGrade.mark,
      feedback: taskGrade.feedback_message,
    };
    await request.post("", body);
  } catch (error) {
    throw handleError(error, "calificar la tarea");
  }
}

export async function gradeExam(
  courseId: string,
  examGrade: ExamGrade
): Promise<void> {
  try {
    examGradeSchema.parse(examGrade);
    const request = await createGradeSubmissionRequest(
      courseId,
      examGrade.resourceId,
      examGrade.studentId
    );
    const body = {
      mark: examGrade.mark,
      feedback: examGrade.feedback_message,
      corrections: examGrade.correctExamItems,
    };
    await request.post("", body);
  } catch (error) {
    throw handleError(error, "calificar el examen");
  }
}

export async function getTaskGrade(
  courseId: string,
  taskId: number,
  studentId: number
): Promise<TaskGrade | null> {
  try {
    const request = await createGradeSubmissionRequest(
      courseId,
      taskId,
      studentId
    );
    const response = await request.get("");
    const responseData = response.data.data;

    if (!responseData.mark) {
      return null;
    }

    return new TaskGrade(
      taskId,
      studentId,
      responseData.mark,
      responseData.feedback
    );
  } catch (error) {
    throw handleError(error, "obtener la calificación de la tarea");
  }
}

export async function getExamGrade(
  courseId: string,
  examId: number,
  studentId: number
): Promise<ExamGrade | null> {
  try {
    const request = await createGradeSubmissionRequest(
      courseId,
      examId,
      studentId
    );
    const response = await request.get("");
    const responseData = response.data.data;

    if (!responseData.mark) {
      return null;
    }

    return new ExamGrade(
      examId,
      studentId,
      responseData.mark,
      responseData.feedback,
      responseData.corrections
    );
  } catch (error) {
    throw handleError(error, "obtener la calificación de la tarea");
  }
}

export async function getSubmissionsByStudent(
  courseId: string,
  studentId: number
): Promise<ActivitySubmission[]> {
  try {
    const request = await createGetSubmissionsByStudentRequest(
      courseId,
      studentId
    );
    const response = await request.get("");
    const submissionsData = response.data.data;

    return submissionsData.map((activity: any) => {
      if (activity.type === ActivityType.TASK) {
        return new TaskSubmission(
          activity.resource_id,
          studentId,
          activity.delivered,
          getDateFromBackend(activity.due_date),
          null,
          activity.delivered_date
            ? getDateFromBackend(activity.delivered_date)
            : null
        );
      } else if (activity.type === ActivityType.EXAM) {
        return new ExamSubmission(
          activity.resource_id,
          studentId,
          [],
          activity.delivered,
          getDateFromBackend(activity.due_date),
          activity.delivered_date
            ? getDateFromBackend(activity.delivered_date)
            : null
        );
      }
    });
  } catch (error) {
    throw handleError(error, "obtener las entregas del estudiante");
  }
}

export async function autocorrectExam(
  courseId: string,
  examId: number,
  studentId: number
): Promise<void> {
  try {
    const request = await createAutocorrectExamRequest(
      courseId,
      examId,
      studentId
    );
    await request.post("");
  } catch (error) {
    throw handleError(error, "corregir el examen con IA");
  }
}

export async function getExamAutocorrection(
  courseId: string,
  examId: number,
  studentId: number
): Promise<ExamAutocorrection> {
  try {
    const request = await createGetExamAutocorrectionRequest(
      courseId,
      examId,
      studentId
    );
    const response = await request.get("");
    const responseData = response.data.data;

    if (responseData.status !== AutocorrectionStatus.COMPLETED) {
      return new ExamAutocorrection(
        responseData.id,
        responseData.status,
        null,
        null,
        getDateFromBackend(responseData.created_at),
        []
      ); // La autocorrección no ha sido completada
    }

    return new ExamAutocorrection(
      responseData.id,
      responseData.status,
      responseData.mark,
      responseData.feedback,
      getDateFromBackend(responseData.created_at),
      responseData.corrections.map((item: any, index: number) => {
        return new ExamItemAutocorrection(
          index,
          item.score === CORRECT_AUTOCORRECTED_ANSWER,
          item.feedback
        );
      })
    );
  } catch (error) {
    if (error.response?.status === 404) {
      return new ExamAutocorrection(
        null,
        AutocorrectionStatus.NOT_STARTED,
        null,
        null,
        null,
        []
      ); // No se inició una autocorrección todavía
    }
    throw handleError(error, "obtener la autocorrección del examen");
  }
}
