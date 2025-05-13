import {
  TeacherActivity,
  Activity,
  ActivityDetails,
  StudentActivity,
  ActivitiesOption,
  ActivityType,
  ActivitySubmission,
} from "@/types/activity";
import { handleError } from "./errorHandling";
import { AxiosInstance } from "axios";
import {
  createActivityRequest,
  createActivitySubmissionsRequest,
  createActivitySubmissionRequest,
  createExamsRequest,
  createTasksRequest,
  createActivitiesRequest,
  createModuleRequest,
  createGetModuleRequest,
  createExamRequest,
  createTaskRequest,
  createTaskPostRequest,
  createExamPostRequest,
} from "@/api/activities";
import {
  activityDetailsSchema,
  activityDetailsSchemaUpdate,
} from "@/validations/activities";

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
            activityData.type,
            new ActivityDetails(
              activityData.title,
              activityData.description,
              activityData.instruction,
              new Date(activityData.due_date)
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
            activityData.type,
            new ActivityDetails(
              activityData.title,
              activityData.description,
              activityData.instruction,
              new Date(activityData.due_date)
            )
          ),
          activityData.status
        )
    );

    return activities;
  } catch (error) {
    throw handleError(error, "obtener las actividades del curso");
  }
}

export async function getStudentActivity(courseId: string, activityId: number) {
  try {
    const request = await createActivityRequest(courseId, activityId);
    const response = await request.get("");
    const activityData = response.data.data;
    const activity = new StudentActivity(
      new Activity(
        activityData.resource_id,
        activityData.type,
        new ActivityDetails(
          activityData.title,
          activityData.description,
          activityData.instruction,
          new Date(activityData.due_date)
        )
      ),
      activityData.status
    );
    return activity;
  } catch (error) {
    throw handleError(error, "obtener la actividad del estudiante");
  }
}

export async function getTeacherActivity(courseId: string, activityId: number) {
  try {
    // for now, use the get all activities endpoint and filter the activity

    const activities = await getCourseTeacherActivities(
      courseId,
      ActivitiesOption.ALL
    );
    const activity = activities.find(
      (activity) => activity.activity.resourceId === activityId
    );
    if (!activity) {
      throw new Error("Actividad no encontrada");
    }

    // const request = await createActivitiesRequest(courseId, getActivitiesOption.ALL);

    // const request = await createActivityRequest(courseId, activityId);
    // const response = await request.get("");
    // const activityData = response.data.data;
    // const activity: TeacherActivity = new TeacherActivity(
    //   new Activity(
    //     activityData.resource_id,
    //     activityData.type,
    //     new ActivityDetails(
    //       activityData.title,
    //       activityData.description,
    //       activityData.instruction,
    //       new Date(activityData.due_date)
    //     )
    //   ),
    //   activityData.visible
    // );

    return activity;
  } catch (error) {
    throw handleError(error, "obtener la actividad del profesor");
  }
}

export async function postActivity(
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
        activityData.type,
        new ActivityDetails(
          activityData.title,
          activityData.description,
          activityData.instruction,
          new Date(activityData.due_date)
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
  activityDetails: ActivityDetails
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
      description: activityDetails.description,
      instruction: activityDetails.instruction,
      due_date: activityDetails.dueDate.toISOString(),
    };

    const response = await request.patch("", body);
    const activityData = response.data.data;
    const updatedActivity = new TeacherActivity(
      new Activity(
        activityData.resource_id,
        activityData.type,
        new ActivityDetails(
          activityData.title,
          activityData.description,
          activityData.instruction,
          new Date(activityData.due_date)
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
  activityId: number
): Promise<ActivitySubmission[]> {
  try {
    const request = await createActivitySubmissionsRequest(
      courseId,
      activityId
    );
    const response = await request.get("");
    const submissionsData = response.data.data;
    const submissions: [] = submissionsData.map(
      (activityData: any) =>
        new ActivitySubmission(
          activityData.resource_id,
          activityData.activity_type,
          activityData.student_id,
          activityData.response,
          activityData.status,
          new Date(activityData.submission_date)
        )
    );
    return submissions;
  } catch (error) {
    throw handleError(error, "obtener las entregas de la actividad");
  }
}

export async function getActivitySubmission(
  courseId: string,
  activityId: number,
  studentId: number
): Promise<any> {
  try {
    const request = await createActivitySubmissionRequest(
      courseId,
      activityId,
      studentId
    );
    const response = await request.get("");
    const submissionData = response.data.data;
    return submissionData;
  } catch (error) {
    throw handleError(error, "obtener la entrega de la actividad");
  }
}

export async function createActivity(
  courseId: string,
  moduleId: string,
  activityType: ActivityType,
  activityDetails: ActivityDetails
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
      description: activityDetails.description,
      instruction: activityDetails.instruction,
      due_date: activityDetails.dueDate.toISOString(),
      module: moduleId,
      visible: false,
    };

    const response = await request.post("", body);

    const activityData = response.data.data;
    const newActivity = new TeacherActivity(
      new Activity(
        activityData.resource_id,
        activityData.type,
        new ActivityDetails(
          activityData.title,
          activityData.description,
          activityData.instruction,
          new Date(activityData.due_date)
        )
      ),
      activityData.visible
    );

    return newActivity;
  } catch (error) {
    throw handleError(error, "crear la actividad");
  }
}

export async function getCourseModuleId(courseId: string) {
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
