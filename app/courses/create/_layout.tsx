import { RequiredCoursesProvider } from "@/utils/storage/requiredCoursesContext";
import { Stack } from "expo-router";

export default function CoursesLayout() {
    return (
        <RequiredCoursesProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </RequiredCoursesProvider>
    );
}
