import { createGetSearchedCoursesRequest } from "@/api/axios";
import Course from "@/types/course";
import CourseDetails from "@/types/courseDetails";
import {
  levels,
  categories,
  modalities,
} from "@/utils/constants/courseDetails";

export async function getSearchedCourses(
  accessToken: string,
  userId: number,
  searchQuery: string,
  onlyOwnCourses: boolean
): Promise<Course[]> {
  /* const request = createGetSearchedCoursesRequest(
    accessToken,
    userId,
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
  }); */
  const courses: Course[] = [
    new Course(
      1,
      10,
      new CourseDetails(
        "Curso de Matemáticas",
        "Aprende álgebra y geometría básica.",
        30,
        new Date("2025-05-01"),
        new Date("2025-06-30"),
        levels[2], // Universitario
        modalities[1], // Virtual
        categories[9] // Matemáticas
      )
    ),
    new Course(
      2,
      3,
      new CourseDetails(
        "Curso de Inglés",
        "Mejora tus habilidades de conversación en inglés.",
        20,
        new Date("2025-06-01"),
        new Date("2025-07-15"),
        levels[1], // Secundaria
        modalities[0], // Presencial
        categories[7] // Idiomas
      )
    ),
    new Course(
      3,
      23,
      new CourseDetails(
        "Curso de Programación",
        "Introducción a la programación en Python.",
        25,
        new Date("2025-07-01"),
        new Date("2025-08-31"),
        levels[3], // Postgrado
        modalities[2], // Híbrido
        categories[12] // Programación
      )
    ),
    new Course(
      4,
      25,
      new CourseDetails(
        "Curso de Física",
        "Explora los fundamentos de la mecánica clásica.",
        40,
        new Date("2025-04-01"),
        new Date("2025-05-31"),
        levels[2], // Universitario
        modalities[0], // Presencial
        categories[4] // Física
      )
    ),
    new Course(
      5,
      8,
      new CourseDetails(
        "Curso de Historia del Arte",
        "Descubre las principales corrientes artísticas a lo largo de la historia.",
        15,
        new Date("2025-03-15"),
        new Date("2025-05-15"),
        levels[1], // Secundaria
        modalities[1], // Virtual
        categories[0] // Arte
      )
    ),
    new Course(
      6,
      0,
      new CourseDetails(
        "Curso de Robótica",
        "Aprende a construir y programar robots básicos.",
        10,
        new Date("2025-06-10"),
        new Date("2025-08-10"),
        levels[3], // Postgrado
        modalities[2], // Híbrido
        categories[14] // Robótica
      )
    ),
    new Course(
      7,
      12,
      new CourseDetails(
        "Curso de Música",
        "Inicia tu camino en la teoría musical y composición.",
        25,
        new Date("2025-07-01"),
        new Date("2025-09-01"),
        levels[0], // Primaria
        modalities[3], // Asincrónico
        categories[10] // Música
      )
    ),
    new Course(
      8,
      24,
      new CourseDetails(
        "Curso de Tecnología Educativa",
        "Explora herramientas tecnológicas para la enseñanza.",
        35,
        new Date("2025-05-20"),
        new Date("2025-07-20"),
        levels[2], // Universitario
        modalities[1], // Virtual
        categories[15] // Tecnología
      )
    ),
  ];

  return courses;
}
