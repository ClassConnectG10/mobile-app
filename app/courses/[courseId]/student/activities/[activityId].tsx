import {
  getActivitySubmission,
  getStudentActivity,
  submitActivity,
} from "@/services/activityManagement";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function ActivityDetails() {
  const router = useRouter();
  const [studentActivity, setStudentActivity] =
    useState<StudentActivity | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [response, setResponse] = useState("");
  const [activitySubmission, setActivitySubmission] =
    useState<ActivitySubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { courseId: courseIdParam, activityId: activityIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const activityId = activityIdParam as string;

  const userContext = useUserContext();

  const fetchStudentActivity = async () => {
    try {
      setIsLoading(true);
      const activity = await getStudentActivity(courseId, Number(activityId));
      setStudentActivity(activity);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentActivitySubmission = async () => {
    if (!studentActivity || !userContext.user) return;

    try {
      setIsLoading(true);
      const response = await getActivitySubmission(
        courseId,
        studentActivity.activity,
        userContext.user.id,
      );

      setActivitySubmission(response);
      setResponse(response.response);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!studentActivity || !userContext.user) return;

    try {
      setIsLoading(true);
      await submitActivity(courseId, studentActivity.activity, response);
      const submission = await getActivitySubmission(
        courseId,
        studentActivity.activity,
        userContext.user.id,
      );

      setActivitySubmission(submission);
      setStudentActivity((prev) => ({
        ...prev,
        submited: true,
        submitedDate: submission.submissionDate,
      }));
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentActivity();
  }, [courseId, activityId]);

  useEffect(() => {
    if (studentActivity) {
      fetchStudentActivitySubmission();
    }
  }, [studentActivity]);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content
            title={
              studentActivity?.activity.type === ActivityType.TASK
                ? "Información de la tarea"
                : "Información del examen"
            }
          />
        </Appbar.Header>
        {studentActivity && (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            {/* <ActivityCard activity={studentActivity} /> */}
            {activitySubmission && (
              <SubmissionCard
                student={userContext.user}
                submission={activitySubmission}
              />
            )}

            <TextField
              label="Título"
              value={studentActivity.activity.activityDetails.title}
            />

            <TextField
              label="Descripción"
              value={studentActivity.activity.activityDetails.description}
            />
            <TextField
              label="Instrucciones"
              value={studentActivity.activity.activityDetails.instruction}
            />

            <TextField
              label="Fecha límite"
              value={formatDateTime(
                studentActivity.activity.activityDetails.dueDate,
              )}
            />

            {studentActivity && studentActivity.submited && (
              <TextField
                label="Fecha de entrega"
                value={formatDateTime(studentActivity.submitedDate)}
              />
            )}

            <ToggleableTextInput
              label="Respuesta"
              value={response}
              placeholder={"Escribe tu respuesta aquí"}
              editable={!studentActivity.submited}
              onChange={setResponse}
            />

            {studentActivity && !studentActivity.submited && (
              <Button
                mode="contained"
                onPress={handleSubmitResponse}
                disabled={isLoading || response.trim() === ""}
              >
                Enviar respuesta
              </Button>
            )}
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
