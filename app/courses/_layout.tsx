import { Stack } from "expo-router";
import { CourseProvider } from "@/utils/storage/courseContext";

export default function CoursesLayout() {
  return (
    <CourseProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CourseProvider>
  );
}
