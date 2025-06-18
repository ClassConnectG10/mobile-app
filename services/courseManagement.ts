import {
  Course,
  CourseDetails,
  SearchFilters,
  SearchOption,
} from "@/types/course";
import { handleError } from "./common";
import {
  courseDetailsSchema,
  courseDetailsUpdateSchema,
} from "@/validations/courses";
import {
  createAddAssistantRequest,
  createAssistantLogsRequest,
  createAssistantRequest,
  createAssistantsRequest,
  createCourseRequest,
  createCoursesRequest,
  createEnrollCourseRequest,
  createFavoriteCourseRequest,
  createMarksRequest,
  createSearchCoursesRequest,
  createStartCourseRequest,
  createStudentMarkRequest,
  createStudentRequest,
  createStudentsRequest,
} from "@/api/courses";
import { User } from "@/types/user";
import { getBulkUsers } from "./userManagement";
import { AssistantLog } from "@/types/assistantLog";
import { getDateFromBackend } from "./common";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function createCourse(
  courseDetails: CourseDetails
): Promise<string> {
  try {
    courseDetailsSchema.parse(courseDetails);

    const body = {
      title: courseDetails.title,
      description: courseDetails.description,
      capacity: courseDetails.maxNumberOfStudents,
      start_date: formatDate(courseDetails.startDate),
      end_date: formatDate(courseDetails.endDate),
      level: courseDetails.level,
      modality: courseDetails.modality,
      category: courseDetails.category,
      dependencies: courseDetails.dependencies,
    };

    const request = await createCoursesRequest();
    const response = await request.post("", body);

    const courseData = response.data.data;
    const courseId = courseData.id;

    return courseId;
  } catch (error) {
    console.error("Error al crear el curso:", error);
    throw handleError(error, "crear el curso");
  }
}

export async function getCourse(courseId: string): Promise<Course> {
  try {
    const request = await createCourseRequest(courseId);
    const response = await request.get("");
    const courseData = response.data.data;

    const course = new Course(
      courseData.id,
      new CourseDetails(
        courseData.title,
        courseData.description,
        courseData.capacity,
        new Date(courseData.start_date),
        new Date(courseData.end_date),
        courseData.level,
        courseData.modality,
        courseData.category,
        courseData.dependencies.map((dep: any) => dep.course_id)
      ),
      courseData.user_role,
      courseData.status,
      courseData.owner ? courseData.owner : null,
      courseData.students ? courseData.students : 0,
      courseData.is_favorite
    );
    return course;
  } catch (error) {
    throw handleError(error, "obtener el curso");
  }
}

export async function searchCourses(
  searchFilters: SearchFilters,
  searchOption: SearchOption
): Promise<Course[]> {
  try {
    const request = await createSearchCoursesRequest(
      searchFilters,
      searchOption
    );
    const response = await request.get("");
    const coursesData = response.data.data;
    console.log("Courses data:", coursesData);

    const courses: Course[] = coursesData.map((courseData: any) => {
      return new Course(
        courseData.id,
        new CourseDetails(
          courseData.title,
          courseData.description,
          courseData.capacity,
          new Date(courseData.start_date),
          new Date(courseData.end_date),
          courseData.level,
          courseData.modality,
          courseData.category
        ),
        courseData.user_role
      );
    });

    return courses;
  } catch (error) {
    throw handleError(error, "buscar cursos");
  }
}

export async function enrollCourse(courseId: string) {
  try {
    const request = await createEnrollCourseRequest(courseId);
    await request.post("");
  } catch (error) {
    throw handleError(error, "inscribirse en el curso");
  }
}

export async function editCourse(
  course: Course,
  newCourseDetails: CourseDetails
): Promise<CourseDetails> {
  try {
    courseDetailsUpdateSchema.parse(newCourseDetails);

    if (course.numberOfStudens > newCourseDetails.maxNumberOfStudents) {
      throw new Error(
        "El nuevo número máximo de estudiantes no puede ser menor que el número actual de estudiantes"
      );
    }

    const body = {
      title: newCourseDetails.title,
      description: newCourseDetails.description,
      start_date: formatDate(newCourseDetails.startDate),
      end_date: formatDate(newCourseDetails.endDate),
      capacity: newCourseDetails.maxNumberOfStudents,
      category: newCourseDetails.category,
      level: newCourseDetails.level,
      modality: newCourseDetails.modality,
      dependencies: newCourseDetails.dependencies,
    };

    const request = await createCourseRequest(course.courseId);
    const response = await request.patch("", body);

    const courseData = response.data.data;
    const updatedCourseDetails = new CourseDetails(
      courseData.title,
      courseData.description,
      courseData.capacity,
      new Date(courseData.start_date),
      new Date(courseData.end_date),
      courseData.level,
      courseData.modality,
      courseData.category,
      newCourseDetails.dependencies
    );

    return updatedCourseDetails;
  } catch (error) {
    throw handleError(error, "editar el curso");
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    const request = await createCourseRequest(courseId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar el curso");
  }
}

export async function addCourseToFavorites(courseId: string): Promise<void> {
  try {
    const request = await createFavoriteCourseRequest(courseId);
    await request.post("");
  } catch (error) {
    throw handleError(error, "agregar el curso a favoritos");
  }
}

export async function removeCourseFromFavorites(
  courseId: string
): Promise<void> {
  try {
    const request = await createFavoriteCourseRequest(courseId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar el curso de favoritos");
  }
}

export async function startCourse(courseId: string): Promise<void> {
  try {
    const request = await createStartCourseRequest(courseId);
    await request.post("");
  } catch (error) {
    throw handleError(error, "iniciar el curso");
  }
}

export async function getCourseAssistants(courseId: string): Promise<User[]> {
  try {
    const request = await createAssistantsRequest(courseId);
    const response = await request.get("");
    const assistantsData = response.data.data;

    const assistants: User[] = await getBulkUsers(
      assistantsData.map((assistant: any) => assistant.user_id)
    );

    return assistants;
  } catch (error) {
    throw handleError(error, "obtener los asistentes del curso");
  }
}

export async function addAssistantToCourse(
  courseId: string,
  assistantId: number
): Promise<void> {
  try {
    const request = await createAddAssistantRequest(courseId, assistantId);
    await request.post("", {});
  } catch (error) {
    throw handleError(error, "agregar asistente al curso");
  }
}

export async function removeAssistantFromCourse(
  courseId: string,
  assistantId: number
): Promise<void> {
  try {
    const request = await createAssistantRequest(courseId, assistantId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar asistente del curso");
  }
}

export async function getCourseStudents(courseId: string): Promise<User[]> {
  try {
    const request = await createStudentsRequest(courseId);
    const response = await request.get("");
    const studentsData = response.data.data;

    const students: User[] = await getBulkUsers(
      studentsData.map((student: any) => student.user_id)
    );

    return students;
  } catch (error) {
    throw handleError(error, "obtener los estudiantes del curso");
  }
}

export async function removeStudentFromCourse(
  courseId: string,
  studentId: number
): Promise<void> {
  try {
    const request = await createStudentRequest(courseId, studentId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "eliminar estudiante del curso");
  }
}

export async function getStudentMark(
  courseId: string,
  studentId: number
): Promise<number | null> {
  try {
    const request = await createStudentMarkRequest(courseId, studentId);
    const response = await request.get("");
    return response.data.data.mark;
  } catch (error) {
    if (error.response.status === 404 || error.response.status === 403) {
      return null; // No se encontró la calificación o no pertenece al curso
    }
    throw handleError(error, "obtener la calificación del estudiante");
  }
}

export async function setStudentMark(
  courseId: string,
  studentId: number,
  mark: number
): Promise<void> {
  try {
    const request = await createMarksRequest(courseId);
    await request.post("", {
      user_id: studentId,
      mark: mark,
    });
  } catch (error) {
    throw handleError(error, "establecer la calificación del estudiante");
  }
}

export async function getAssistantLogs(
  courseId: string,
  assistantId: number
): Promise<AssistantLog[]> {
  try {
    const request = await createAssistantLogsRequest(courseId, assistantId);
    const response = await request.get("");
    const logsData = response.data.data;

    const logs: AssistantLog[] = logsData.map(
      (log: any) =>
        new AssistantLog(
          log.log_id,
          log.user_id,
          getDateFromBackend(log.timestamp),
          log.log
        )
    );

    return logs;
  } catch (error) {
    throw handleError(error, "obtener los registros del asistente");
  }
}
