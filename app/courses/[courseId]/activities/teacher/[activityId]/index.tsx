import ActivityCard from "@/components/ActivityCard";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import SubmissionCard from "@/components/SubmissionCard";
import {
  getActivitySubmissions,
  getTeacherActivity,
} from "@/services/activityManagement";
import {
  ActivitySubmission,
  StudentActivity,
  TeacherActivity,
} from "@/types/activity";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { ActivityIndicator, Appbar, Text, useTheme } from "react-native-paper";

export default function TeacherActivityPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, activityId: activityIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const activityId = activityIdParam as string;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherActivity, setTeacherActivity] =
    useState<TeacherActivity | null>(null);
  const [studentSubmissions, setStudentSubmissions] = useState<
    ActivitySubmission[]
  >([]);

  async function fetchTeacherActivity() {
    try {
      setIsLoading(true);
      console.log("Cargando actividad de docente");
      console.log("CourseID: ", courseId);
      console.log("ActivityID: ", activityId);
      if (courseId && activityId) {
        const activity = await getTeacherActivity(courseId, activityId);
        console.log("Actividad de docente", activity);
        setTeacherActivity(activity);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchStudentActivities() {
    try {
      setIsLoading(true);
      console.log("Cargando actividad de docente");
      console.log("CourseID: ", courseId);
      console.log("ActivityID: ", activityId);
      if (courseId && activityId) {
        const submissions = await getActivitySubmissions(courseId, activityId);
        console.log("Actividades de docente", submissions);
        setStudentSubmissions(submissions);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTeacherActivity();
    fetchStudentActivities();
  }, [courseId, activityId]);

  return (
    <>
      <View>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={"Información de la actividad"} />
          <Appbar.Action icon="information-outline" />
        </Appbar.Header>
        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <View>
            <Text>Detalles de la actividad</Text>
            <FlatList
              style={styles.scrollContainer}
              data={studentSubmissions}
              keyExtractor={(item) => item.resourceId}
              renderItem={({ item }) => <SubmissionCard submission={item} />}
              // ListHeaderComponent={() => ()}
              // ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
          </View>
        )}
        <ErrorMessageSnackbar
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    // padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
});
