import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import SubmissionCard from "@/components/SubmissionCard";
import { getActivitySubmissions } from "@/services/activityManagement";
import { ActivitySubmission } from "@/types/activity";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { ActivityIndicator, Appbar, Text } from "react-native-paper";

export default function TeacherSubmissionsPage() {
  const router = useRouter();
  const { courseId: courseIdParam, activityId: activityIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const activityId = activityIdParam as string;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [studentSubmissions, setStudentSubmissions] = useState<
    ActivitySubmission[]
  >([]);

  async function fetchSubmissions() {
    setIsLoading(true);
    try {
      if (courseId && activityId) {
        const submissionsData = await getActivitySubmissions(
          courseId,
          Number(activityId),
        );

        console.log("Submissions data", submissionsData);

        setStudentSubmissions(submissionsData);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSubmissions();
  }, [courseId, activityId]);

  return (
    <View>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Entregas" />
        <Appbar.Action
          icon="refresh"
          onPress={fetchSubmissions}
          disabled={isLoading}
        />
      </Appbar.Header>
      {isLoading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          style={{ marginTop: 20 }}
        />
      ) : errorMessage ? (
        <Text>{errorMessage}</Text>
      ) : (
        <FlatList
          style={styles.scrollContainer}
          data={studentSubmissions}
          keyExtractor={(item) => item.resourceId.toString()}
          renderItem={({ item }) => <SubmissionCard submission={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    // padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
});
