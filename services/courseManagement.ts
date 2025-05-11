import {
  createCreateCourseRequest,
  createGetCourseRequest,
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

export async function createCourse(courseDetails: CourseDetails) {
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
    console.log("body: ", body);

    const request = await createCreateCourseRequest();
    const response = await request.post("", body);

    console.log("response: ", response);
  } catch (error) {
    throw handleError(error, "crear el curso");
  }
}

export async function getCourse(courseId: string): Promise<Course> {
  try {
    throw new Error("No se puede obtener el curso");
    const request = await createGetCourseRequest(courseId);
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

export async function getSearchedCourses(
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
