import {
  createCreateCourseRequest,
  createGetCourseRequest,
  createGetSearchedCoursesRequest,
} from "@/api/axios";
import Course from "@/types/course";
import CourseDetails from "@/types/courseDetails";
import { handleError } from "./errorHandling";
import { courseDetailsSchema } from "@/validations/courses";

export async function createCourse(courseDetails: CourseDetails) {
  try {
    console.log("courseDetails: ", courseDetails);
    courseDetailsSchema.parse(courseDetails);
    const request = await createCreateCourseRequest();
    const response = await request.post("", {
      title: courseDetails.title,
      description: courseDetails.description,
      capacity: courseDetails.maxNumberOfStudents,
      start_date: courseDetails.startDate,
      end_date: courseDetails.endDate,
      level: courseDetails.level,
      modality: courseDetails.modality,
      category: courseDetails.category,
      eligibility_criteria: {
        minimum_level: 0,
        minimum_score: 0,
      },
    });

    console.log("response: ", response);
  } catch (error) {
    throw handleError(error, "crear el curso");
  }
}

export async function getCourse(courseId: number): Promise<Course> {
  try {
    const request = await createGetCourseRequest(courseId);
    const response = await request.get("");
    const courseData = response.data;
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
        courseData.modality,
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
  onlyOwnCourses: boolean
): Promise<Course[]> {
  const request = await createGetSearchedCoursesRequest(
    searchQuery,
    onlyOwnCourses
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
