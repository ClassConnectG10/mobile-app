import {
  getActivitySubmission,
  getStudentActivity,
  getStudentExam,
  submitActivity,
} from "@/services/activityManagement";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { Appbar, Button } from "react-native-paper";
import {
  ActivitySubmission,
  ActivityType,
  StudentActivity,
} from "@/types/activity";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/forms/TextField";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { useUserContext } from "@/utils/storage/userContext";
import SubmissionCard from "@/components/cards/SubmissionCard";
import { formatDateTime } from "@/utils/date";

export default function StudentExamPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [studentActivity, setStudentActivity] =
    useState<StudentActivity | null>(null);
  const { courseId: courseIdParam, examId: examIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const examId = Number(examIdParam);

  const fetchStudentActivity = async () => {
    try {
      setIsLoading(true);
      const activity = await getStudentExam(courseId, examId);
      setStudentActivity(activity);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudentActivity();
    }, [courseId, examId])
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={"Información del examen"} />
        </Appbar.Header>
        {studentActivity && (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <TextField
              label="Título"
              value={studentActivity.activity.activityDetails.title}
            />

            <TextField
              label="Instrucciones"
              value={studentActivity.activity.activityDetails.instructions}
            />

            <TextField
              label="Fecha límite"
              value={formatDateTime(
                studentActivity.activity.activityDetails.dueDate
              )}
            />

            {/* {studentActivity && studentActivity.submited && (
              <TextField
                label="Fecha de entrega"
                value={formatDateTime(studentActivity.submitedDate)}
              />
            )} */}
          </ScrollView>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
