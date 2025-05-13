import { getActivitySubmission } from "@/services/activityManagement";
import { ActivitySubmission } from "@/types/activity";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function TeacherSubmissionPage() {
  const router = useRouter();
  const {
    courseId: courseIdParam,
    activityId: activityIdParam,
    studentIdParam,
  } = useLocalSearchParams();

  const courseId = courseIdParam as string;
  const activityId = activityIdParam as string;
  const studentId = studentIdParam as string;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [studentSubmission, setStudentSubmission] =
    useState<ActivitySubmission | null>(null);

  async function fetchSubmission() {
    setIsLoading(true);
    try {
      if (courseId && activityId && studentId) {
        // const submissionData = await getActivitySubmission(
        // courseId,
        // Number(activityId),
        // studentId
        // );
        // setStudentSubmission(submissionData);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <View>
      <Text>AAA</Text>
    </View>
  );
}
