import CourseDetails from "./courseDetails";

class Course {
  constructor(
    public courseId: number,
    public numberOfStudens: number,
    public courseDetails: CourseDetails
  ) {}
}

export default Course;
