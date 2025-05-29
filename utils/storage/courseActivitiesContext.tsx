import { StudentActivity, TeacherActivity } from "@/types/activity";
import { createContext, useContext, useState } from "react";

/*
ESTE CONTEXTO NO SE USA EN NINGUN LUGAR, HAY QUE VER SI LO USAMOS

*/

interface CourseActivitiesContext {
  courseActivities: StudentActivity[] | TeacherActivity[];
  setCourseActivities: (
    activities: StudentActivity[] | TeacherActivity[]
  ) => void;
  deleteCourseActivities: () => void;
}

const courseActivitiesContext = createContext<CourseActivitiesContext | null>(
  null
);

export const CourseActivitiesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [courseActivities, setCourseActivities] = useState<
    StudentActivity[] | TeacherActivity[]
  >([]);

  const deleteCourseActivities = () => {
    setCourseActivities([]);
  };

  return (
    <courseActivitiesContext.Provider
      value={{ courseActivities, setCourseActivities, deleteCourseActivities }}
    >
      {children}
    </courseActivitiesContext.Provider>
  );
};

export const useCourseActivitiesContext = (): CourseActivitiesContext => {
  const context = useContext(courseActivitiesContext);
  if (!context) {
    throw new Error(
      "useCourseActivitiesContext must be used within a CourseActivitiesProvider"
    );
  }
  return context;
};
