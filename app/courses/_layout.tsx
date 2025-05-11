import { Stack } from "expo-router";
import { CourseProvider } from "@/utils/storage/courseContext";
import { RequiredCoursesProvider } from "@/utils/storage/requiredCoursesContext";

export default function CoursesLayout() {
  return (
    <CourseProvider>
      <RequiredCoursesProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </RequiredCoursesProvider>
    </CourseProvider>
  );
}
