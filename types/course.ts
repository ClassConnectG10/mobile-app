import CourseDetails from "./courseDetails";

class Course {
  constructor(
    public courseId: string,
    public numberOfStudens: number,
    public courseDetails: CourseDetails
  ) {}
}

export default Course;
