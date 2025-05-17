import {
  Course,
  CourseDetails,
  SearchFilters,
  SearchOption,
} from "@/types/course";
import { handleError } from "./errorHandling";
import { courseDetailsSchema } from "@/validations/courses";
import { createModuleRequest } from "@/api/activities";
import {
  createCourseRequest,
  createCoursesRequest,
  createEnrollCourseRequest,
  createFavoriteCourseRequest,
  createSearchCoursesRequest,
  createStartCourseRequest,
} from "@/api/courses";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function createCourse(
  courseDetails: CourseDetails,
): Promise<Course> {
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
    const course = new Course(
      courseData.id,
      courseData.owner,
      new CourseDetails(
        courseData.title,
        courseData.description,
        courseData.capacity,
        new Date(courseData.start_date),
        new Date(courseData.end_date),
        courseData.level,
        courseData.modality,
        courseData.category,
        courseDetails.dependencies,
      ),
      courseData.user_role,
      courseData.status,
      0,
      false,
    );

    const moduleRequest = await createModuleRequest(course.courseId);
    await moduleRequest.post("", {
      title: "Módulo 1",
      description: "Descripción del módulo 1",
    }); // TODO: Sacarlo cuando tengamos todo listo
    return course;
  } catch (error) {
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
      courseData.owner,
      new CourseDetails(
        courseData.title,
        courseData.description,
        courseData.capacity,
        new Date(courseData.start_date),
        new Date(courseData.end_date),
        courseData.level,
        courseData.modality,
        courseData.category,
        courseData.dependencies.map((dep: any) => dep.course_id),
      ),
      courseData.user_role,
      courseData.status,
      courseData.students ? courseData.students : 0,
      courseData.is_favorite,
    );
    return course;
  } catch (error) {
    throw handleError(error, "obtener el curso");
  }
}

export async function searchCourses(
  searchFilters: SearchFilters,
  searchOption: SearchOption,
): Promise<Course[]> {
  const request = await createSearchCoursesRequest(searchFilters, searchOption);
  const response = await request.get("");
  const coursesData = response.data.data;
  const courses: Course[] = coursesData.map((courseData: any) => {
    return new Course(
      courseData.id,
      courseData.ownerId,
      new CourseDetails(
        courseData.title,
        courseData.description,
        courseData.capacity,
        new Date(courseData.start_date),
        new Date(courseData.end_date),
        courseData.level,
        courseData.modality,
        courseData.category,
      ),
      courseData.students ? courseData.students : 0,
      courseData.is_favorite,
    );
  });

  return courses;
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
  newCourseDetails: CourseDetails,
): Promise<Course> {
  try {
    courseDetailsSchema.parse(newCourseDetails);

    if (course.numberOfStudens > newCourseDetails.maxNumberOfStudents) {
      throw new Error(
        "El nuevo número máximo de estudiantes no puede ser menor que el número actual de estudiantes",
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
    const updatedCourse = new Course(
      course.courseId,
      course.ownerId,
      new CourseDetails(
        courseData.title,
        courseData.description,
        courseData.capacity,
        new Date(courseData.start_date),
        new Date(courseData.end_date),
        courseData.level,
        courseData.modality,
        courseData.category,
        newCourseDetails.dependencies,
      ),
      course.currentUserRole,
      course.courseStatus,
      course.numberOfStudens,
      course.isFavorite,
    );
    return updatedCourse;
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
  courseId: string,
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
