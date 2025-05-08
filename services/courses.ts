import CourseInfo from "@/types/courseInfo";

export async function getCoursesByUser(): Promise<CourseInfo[]> {
  const courses = [
    new CourseInfo("Mathematics", "Algebra and Geometry", "math", "#FF5733"),
    new CourseInfo("Science", "Physics and Chemistry", "physics", "#33FF57"),
    new CourseInfo("History", "World History", "world_history", "#3357FF"),
    // new CourseInfo(
    //   "Literature",
    //   "English and Literature",
    //   "languagearts",
    //   "#FF33A1",
    // ),
    new CourseInfo("Art", "Painting and Sculpture", "arts", "#FF8C33"),
    // new CourseInfo(
    //   "Music",
    //   "Theory and Practice",
    //   "learn_instrument",
    //   "#33FFA1",
    // ),
    // new CourseInfo(
    //   "Physical Education",
    //   "Sports and Fitness",
    //   "athletics_jumping",
    //   "#A133FF",
    // ),
    // new CourseInfo(
    //   "Computer Science",
    //   "Programming and Algorithms",
    //   "code",
    //   "#FF33D4",
    // ),

    // new CourseInfo("Geography", "Maps and Territories", "geography", "#33A1FF"),
    // new CourseInfo("Biology", "Living Organisms", "biology", "#57FF33"),
    // new CourseInfo(
    //   "Chemistry",
    //   "Elements and Compounds",
    //   "chemistry",
    //   "#FFAA33",
    // ),
    // new CourseInfo("Psychology", "Mind and Behavior", "psychology", "#8C33FF"),
    // new CourseInfo("Economics", "Markets and Money", "economics", "#33FFD1"),
    // new CourseInfo(
    //   "Language Studies",
    //   "Learning New Languages",
    //   "learn_language",
    //   "#FF3333",
    // ),
    // new CourseInfo(
    //   "Theater",
    //   "Drama and Performance",
    //   "theatre_opera",
    //   "#FF33B5",
    // ),
    // new CourseInfo("Philosophy", "Thinking and Reasoning", "read", "#FFD433"),
  ];

  return courses;
}
