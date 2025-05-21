import {
  TeacherActivity,
  Activity,
  TaskDetails,
  StudentActivity,
  ActivitiesOption,
  ActivityType,
  ActivitySubmission,
  ExamDetails,
} from "@/types/activity";
import { examItemToJSON, getExamItemFromJSON, handleError } from "./common";
import { AxiosInstance } from "axios";
import {
  createActivityRequest,
  createActivitySubmissionsRequest,
  createActivitySubmissionRequest,
  createExamsRequest,
  createTasksRequest,
  createActivitiesRequest,
  createExamRequest,
  createTaskRequest,
  createTaskPostRequest,
  createExamPostRequest,
  createTaskSubmissionPostRequest,
  createExamSubmissionPostRequest,
} from "@/api/activities";
import {
  activityDetailsSchema,
  activityDetailsSchemaUpdate,
  examDetailsSchema,
} from "@/validations/activities";
import { getDateFromBackend } from "@/utils/date";
import { createGetModuleRequest, createModuleRequest } from "@/api/modules";

export async function getCourseTeacherActivities(
  courseId: string,
  activitiesOption: ActivitiesOption
): Promise<TeacherActivity[]> {
  try {
    const request = await createActivitiesRequest(courseId, activitiesOption);
    const response = await request.get("");

    const activitiesData = response.data.data;

    const activities: TeacherActivity[] = activitiesData.map(
      (activityData: any) =>
        new TeacherActivity(
          new Activity(
            activityData.resource_id,
            activityData.module_id,
            activityData.type,
            new TaskDetails(
              activityData.title,
              activityData.instruction,
              getDateFromBackend(activityData.due_date)
            )
          ),
          activityData.visible
        )
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
    const request = await createActivitiesRequest(
      courseId,
      ActivitiesOption.ALL
    );
    const response = await request.get("");

    const activitiesData = response.data.data;

    const activities: TeacherActivity[] = activitiesData.map(
      (activityData: any) =>
        new TeacherActivity(
          new Activity(
            activityData.resource_id,
            activityData.module_id,
            activityData.type,
            new TaskDetails(
              activityData.title,
              activityData.instruction,
              getDateFromBackend(activityData.due_date)
            )
          ),
          activityData.visible
        )
    );
    return activities.filter(
      (activity) => activity.activity.moduleId === moduleId
    );
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
      (activityData: any) =>
        new StudentActivity(
          new Activity(
            activityData.resource_id,
            activityData.module_id,
            activityData.type,
            new TaskDetails(
              activityData.title,
              activityData.instruction,
              getDateFromBackend(activityData.due_date)
            )
          ),
          activityData.delivered,
          activityData.delivered_date
            ? getDateFromBackend(activityData.delivered_date)
            : null
        )
    );

    return activities;
  } catch (error) {
    throw handleError(error, "obtener las actividades del curso");
  }
}

export async function getStudentActivity(
  courseId: string,
  activityId: number
): Promise<StudentActivity> {
  try {
    const request = await createActivityRequest(courseId, activityId);
    const response = await request.get("");
    const activityData = response.data.data;
    const activity = new StudentActivity(
      new Activity(
        activityData.resource_id,
        activityData.module_id,
        activityData.type,
        new TaskDetails(
          activityData.title,
          activityData.instruction,
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

export async function getTeacherActivity(
  courseId: string,
  activityId: number
): Promise<TeacherActivity> {
  try {
    const request = await createActivityRequest(courseId, activityId);
    const response = await request.get("");

    const activityData = response.data.data;
    const activity: TeacherActivity = new TeacherActivity(
      new Activity(
        activityData.resource_id,
        activityData.module_id,
        activityData.type,
        new TaskDetails(
          activityData.title,
          activityData.instruction,
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

export async function publishActivity(
  courseId: string,
  activity: Activity
): Promise<TeacherActivity> {
  try {
    let request: AxiosInstance;

    if (activity.type === ActivityType.TASK) {
      request = await createTaskPostRequest(courseId, activity.resourceId);
    } else {
      request = await createExamPostRequest(courseId, activity.resourceId);
    }

    const updatedActivity = await request.post("");
    const activityData = updatedActivity.data.data;
    const newActivity = new TeacherActivity(
      new Activity(
        activityData.resource_id,
        activityData.module_id,
        activityData.type,
        new TaskDetails(
          activityData.title,
          activityData.instruction,
          getDateFromBackend(activityData.due_date)
        )
      ),
      activityData.visible
    );

    return newActivity;
  } catch (error) {
    throw handleError(error, "crear la actividad");
  }
}

export async function updateActivity(
  courseId: string,
  activity: Activity,
  activityDetails: TaskDetails
): Promise<TeacherActivity> {
  try {
    activityDetailsSchemaUpdate.parse(activityDetails);

    let request: AxiosInstance;

    if (activity.type === ActivityType.TASK) {
      request = await createTaskRequest(courseId, activity.resourceId);
    } else {
      request = await createExamRequest(courseId, activity.resourceId);
    }

    const body = {
      title: activityDetails.title,
      instruction: activityDetails.instructions,
      due_date: activityDetails.dueDate.toISOString(),
    };

    const response = await request.patch("", body);
    const activityData = response.data.data;
    const updatedActivity = new TeacherActivity(
      new Activity(
        activityData.resource_id,
        activityData.module_id,
        activityData.type,
        new TaskDetails(
          activityData.title,
          activityData.instruction,
          getDateFromBackend(activityData.due_date)
        )
      ),
      activityData.visible
    );
    return updatedActivity;
  } catch (error) {
    throw handleError(error, "actualizar la actividad");
  }
}

export async function deleteActivity(
  courseId: string,
  activity: Activity
): Promise<void> {
  try {
    let request: AxiosInstance;

    if (activity.type === ActivityType.TASK) {
      request = await createTaskRequest(courseId, activity.resourceId);
    } else {
      request = await createExamRequest(courseId, activity.resourceId);
    }

    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar la actividad");
  }
}

export async function getActivitySubmissions(
  courseId: string,
  activity: Activity
): Promise<ActivitySubmission[]> {
  try {
    const request = await createActivitySubmissionsRequest(
      courseId,
      activity.resourceId
    );
    const response = await request.get("");
    const submissionsData = response.data.data;
    const submissions: [] = submissionsData.map(
      (activityData: any) =>
        new ActivitySubmission(
          activityData.task_id,
          activity.type,
          activityData.user_id,
          activityData.external_ref,
          activityData.delivered,
          getDateFromBackend(activityData.due_date),
          activityData.delivered_date
            ? getDateFromBackend(activityData.delivered_date)
            : null
        )
    );
    return submissions;
  } catch (error) {
    throw handleError(error, "obtener las entregas de la actividad");
  }
}

export async function getActivitySubmission(
  courseId: string,
  activity: Activity,
  studentId: number
): Promise<ActivitySubmission> {
  try {
    const request = await createActivitySubmissionRequest(
      courseId,
      activity.resourceId,
      studentId
    );
    const response = await request.get("");

    const submissionData = response.data.data;
    const submission = new ActivitySubmission(
      submissionData.task_id,
      activity.type,
      studentId,
      submissionData.external_ref,
      submissionData.delivered,
      getDateFromBackend(submissionData.due_date),
      submissionData.delivered_date
        ? getDateFromBackend(submissionData.delivered_date)
        : null
    );

    return submission;
  } catch (error) {
    throw handleError(error, "obtener la entrega de la actividad");
  }
}

export async function createActivity(
  courseId: string,
  moduleId: number,
  activityType: ActivityType,
  activityDetails: TaskDetails
): Promise<TeacherActivity> {
  try {
    activityDetailsSchema.parse(activityDetails);

    var request: AxiosInstance;
    if (activityType === ActivityType.TASK) {
      request = await createTasksRequest(courseId);
    } else {
      request = await createExamsRequest(courseId);
    }

    const body = {
      type: activityType,
      title: activityDetails.title,
      instruction: activityDetails.instructions,
      due_date: activityDetails.dueDate.toISOString(),
      module: moduleId,
      visible: false,
    };

    const response = await request.post("", body);

    const activityData = response.data.data;
    const newActivity = new TeacherActivity(
      new Activity(
        activityData.resource_id,
        activityData.module_id,
        activityData.type,
        new TaskDetails(
          activityData.title,
          activityData.instruction,
          getDateFromBackend(activityData.due_date)
        )
      ),
      activityData.visible
    );

    return newActivity;
  } catch (error) {
    throw handleError(error, "crear la actividad");
  }
}

export async function getCourseModuleId(courseId: string): Promise<number> {
  try {
    const request = await createGetModuleRequest(courseId);
    const response = await request.get("");
    const moduleData = response.data.data;

    if (moduleData.length === 0) {
      const moduleRequest = await createModuleRequest(courseId);
      const modulo = await moduleRequest.post("", {
        title: "Módulo por defecto",
        description: "Esto es un modulo por defecto",
      });
      return modulo.data.data.module_id;
    }
    return moduleData[0].module_id;
  } catch (error) {
    throw handleError(error, "obtener el módulo del curso");
  }
}

export async function submitActivity(
  courseId: string,
  activity: Activity,
  response: string
): Promise<void> {
  try {
    let request: AxiosInstance;

    if (activity.type === ActivityType.TASK) {
      request = await createTaskSubmissionPostRequest(
        courseId,
        activity.resourceId
      );
    } else if (activity.type === ActivityType.EXAM) {
      request = await createExamSubmissionPostRequest(
        courseId,
        activity.resourceId
      );
    } else {
      throw new Error("Tipo de actividad no soportado");
    }

    const body = {
      data: response,
    };

    await request.post("", body);
  } catch (error) {
    throw handleError(error, "enviar la actividad");
  }
}

export async function createExam(
  courseId: string,
  examDetails: ExamDetails
): Promise<void> {
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

    await request.post("", body);
  } catch (error) {
    throw handleError(error, "crear el examen");
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

export async function updateTeacherExam(
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
      module: examDetails.moduleId,
      exam_fields: examDetails.examItems.map((item) => examItemToJSON(item)),
    };

    await request.patch("", body);
  } catch (error) {
    throw handleError(error, "actualizar el examen");
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
