import {
  createCreateCourseRequest,
  createCourseRequest as createCourseRequest,
  createGetSearchedCoursesRequest,
} from "@/api/axios";
import Course from "@/types/course";
import CourseDetails from "@/types/courseDetails";
import { handleError } from "./errorHandling";
import { courseDetailsSchema } from "@/validations/courses";
import { SearchOption } from "@/types/searchOption";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function createCourse(
  courseDetails: CourseDetails
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
      modalidad: courseDetails.modality,
      category: courseDetails.category,
    };

    const request = await createCreateCourseRequest();
    const response = await request.post("", body);

    const courseData = response.data.data;
    const course = new Course(
      courseData.id,
      courseData.numberOfStudents,
      new CourseDetails(
        courseData.title,
        courseData.description,
        courseData.capacity,
        new Date(courseData.start_date),
        new Date(courseData.end_date),
        courseData.level,
        courseData.modalidad,
        courseData.category
      )
    );

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
    console.log("courseData: ", courseData);
    const course = new Course(
      courseData.id,
      courseData.numberOfStudents,
      new CourseDetails(
        courseData.title,
        courseData.description,
        courseData.capacity,
        new Date(courseData.start_date),
        new Date(courseData.end_date),
        courseData.level,
        courseData.modalidad,
        courseData.category
      )
    );
    return course;
  } catch (error) {
    throw handleError(error, "obtener el curso");
  }
}

export async function searchCourses(
  searchQuery: string,
  searchOption: SearchOption
): Promise<Course[]> {
  const request = await createGetSearchedCoursesRequest(
    searchQuery,
    searchOption
  );
  const response = await request.get("");
  const coursesData = response.data.data;
  const courses: Course[] = coursesData.map((courseData: any) => {
    return new Course(
      courseData.id,
      courseData.numberOfStudents,
      new CourseDetails(
        courseData.title,
        courseData.description,
        courseData.capacity,
        new Date(courseData.start_date),
        new Date(courseData.end_date),
        courseData.level,
        courseData.modality,
        courseData.category
      )
    );
  });

  return courses;
}

export async function editCourse(
  course: Course,
  newCourseDetails: CourseDetails
): Promise<Course> {
  try {
    courseDetailsSchema.parse(newCourseDetails);

    if (course.numberOfStudens > newCourseDetails.maxNumberOfStudents) {
      throw new Error(
        "El nuevo número máximo de estudiantes no puede ser menor que el número actual de estudiantes"
      );
    }

    const body = {
      title: newCourseDetails.title,
      description: newCourseDetails.description,
      capacity: newCourseDetails.maxNumberOfStudents,
      start_date: formatDate(newCourseDetails.startDate),
      end_date: formatDate(newCourseDetails.endDate),
      level: newCourseDetails.level,
      modalidad: newCourseDetails.modality,
      category: newCourseDetails.category,
    };

    const request = await createCourseRequest(course.courseId);
    const response = await request.patch("", body);
    const courseData = response.data.data;
    const updatedCourse = new Course(
      courseData.id,
      courseData.numberOfStudents,
      new CourseDetails(
        courseData.title,
        courseData.description,
        courseData.capacity,
        new Date(courseData.start_date),
        new Date(courseData.end_date),
        courseData.level,
        courseData.modalidad,
        courseData.category
      )
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
