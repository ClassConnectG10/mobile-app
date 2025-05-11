class CourseDetails {
  constructor(
    public title: string,
    public description: string,
    public maxNumberOfStudents: number,
    public startDate: Date,
    public endDate: Date,
    public level: string,
    public modality: string,
    public category: string,
    public dependencies: number[] = []
  ) {}
}

export default CourseDetails;
