import { getCourse } from "@/services/courseManagement";
import { useCourseContext } from "@/utils/storage/courseContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Appbar, useTheme, Text } from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import CourseCard from "@/components/CourseCard";
import { View, ScrollView } from "react-native";

export default function CoursePage() {
  const router = useRouter();
  const theme = useTheme();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const courseContext = useCourseContext();
  const { setCourse } = courseContext;

  async function fetchCourse() {
    try {
      setIsLoading(true);
      console.log("courseId", courseId);
      const course = await getCourse(courseId);
      setCourse(course);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInfoPress = () => {
    router.push({
      pathname: "/courses/[courseId]/info",
      params: { courseId },
    });
  };

  useEffect(() => {
    if (!courseContext.course) {
      fetchCourse();
    } else {
      setIsLoading(false);
    }
  }, [courseId]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={courseContext.course?.courseDetails.title} />
        <Appbar.Action icon="information-outline" onPress={handleInfoPress} />
      </Appbar.Header>
      {isLoading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.primary}
        />
      ) : (
        <View style={{ flexDirection: "column", padding: 16, flex: 1 }}>
          <ScrollView style={{ marginTop: 16 }}>
            <CourseCard
              name={courseContext.course?.courseDetails.title || ""}
              description={
                courseContext.course?.courseDetails.description || ""
              }
              category={courseContext.course?.courseDetails.category || ""}
            />
            <Text variant="titleLarge" style={{ marginTop: 16 }}>
              Tareas
            </Text>
          </ScrollView>
        </View>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
