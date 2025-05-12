import {
  creatCourseActivitiesRequest,
  creatCourseExamRequest,
  creatCourseTaskRequest,
  createStudentActivityRequest,
} from "@/api/axios";
import {
  TeacherActivity,
  Activity,
  ActivityDetails,
  StudentActivity,
  ActivitiesOption,
  ActivityType,
} from "@/types/activity";
import { handleError } from "./errorHandling";

export async function getCourseTeacherActivities(
  courseId: string,
  activitiesOption: ActivitiesOption
): Promise<TeacherActivity[]> {
  try {
    const request = await creatCourseActivitiesRequest(
      courseId,
      activitiesOption
    );
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
    const request = await creatCourseActivitiesRequest(
      courseId,
      activitiesOption
    );
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

export async function getStudentActivity(courseId: string, activityId: string) {
  try {
    const request = await createStudentActivityRequest(courseId, activityId);
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

export async function createActivity(
  courseId: string,
  activityType: ActivityType,
  activityDetails: ActivityDetails
): Promise<TeacherActivity> {
  try {
    console.log("courseId: ", courseId);
    var request;

    if (activityType === ActivityType.TASK) {
      request = await creatCourseTaskRequest(courseId);
    } else {
      request = await creatCourseExamRequest(courseId);
    }

    const body = {
      type: activityType,
      title: activityDetails.title,
      description: activityDetails.description,
      instruction: activityDetails.instruction,
      due_date: activityDetails.dueDate.toISOString(),
      module: 6,
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
