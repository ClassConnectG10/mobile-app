import { Course } from "@/types/course";
import { createContext, useContext, useState } from "react";

interface requiredCoursesContext {
  requiredCourses: Course[];
  addRequiredCourse: (course: Course) => void;
  setRequiredCourses: (courses: Course[]) => void;
  deleteRequiredCourse: (course: Course) => void;
}

const defaultContext: requiredCoursesContext = {
  requiredCourses: [],
  addRequiredCourse: () => {},
  setRequiredCourses: () => {},
  deleteRequiredCourse: () => {},
};

const RequiredCoursesContext =
  createContext<requiredCoursesContext>(defaultContext);

export const RequiredCoursesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [requiredCourses, setRequiredCourses] = useState<Course[]>([]);

  const addRequiredCourse = (course: Course) => {
    setRequiredCourses((prevCourses) => {
      const courseExists = prevCourses.some(
        (c) => c.courseId === course.courseId
      );
      if (!courseExists) {
        return [...prevCourses, course];
      }
      return prevCourses;
    });
  };

  const deleteRequiredCourse = (course: Course) => {
    setRequiredCourses((prevCourses) =>
      prevCourses.filter((c) => c !== course)
    );
  };

  return (
    <RequiredCoursesContext.Provider
      value={{
        requiredCourses,
        addRequiredCourse,
        setRequiredCourses,
        deleteRequiredCourse,
      }}
    >
      {children}
    </RequiredCoursesContext.Provider>
  );
};

export const useRequiredCoursesContext = (): requiredCoursesContext => {
  return useContext(RequiredCoursesContext);
};
