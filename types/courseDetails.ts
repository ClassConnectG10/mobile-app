class CourseDetails {
  constructor(
    public name: string,
    public description: string,
    public numberOfStudents: number,
    public startDate: Date,
    public endDate: Date,
    public level: string,
    public modality: string,
    public category: string
  ) {}
}

export default CourseDetails;
