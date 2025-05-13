import { getStudentActivity } from "@/services/activityManagement";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Appbar, Button, Text } from "react-native-paper";
import { ActivityStatus, StudentActivity } from "@/types/activity";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/TextField";
import { ToggleableTextInput } from "@/components/ToggleableTextInput";
import ActivityCard from "@/components/ActivityCard";

export default function ActivityDetails() {
  const router = useRouter();
  const [studentActivity, setStudentActivity] =
    useState<StudentActivity | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { courseId: courseIdParam, activityId: activityIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const activityId = activityIdParam as string;

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

  useEffect(() => {
    fetchStudentActivity();
  });

  const handleSubmitResponse = async () => {
    try {
      setIsLoading(true);
      // Handle response submission logic here
      // await submitResponse(courseId, activityId, response);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={"Información de la actividad"} />
          <Appbar.Action icon="information-outline" />
        </Appbar.Header>
        <Text>Detalles de la actividad</Text>
        {studentActivity && (
          <View>
            <ActivityCard activity={studentActivity} />

            <TextField
              label="Descripción"
              value={studentActivity.activity.activityDetails.description}
            />
            <TextField
              label="Instrucciones"
              value={studentActivity.activity.activityDetails.instruction}
            />

            <ToggleableTextInput
              label="Respuesta"
              value={response}
              placeholder={"Escribe tu respuesta aquí"}
              editable={true}
              onChange={setResponse}
            />

            <Button
              mode="contained"
              onPress={handleSubmitResponse}
              disabled={
                isLoading ||
                !response ||
                response.trim() === "" ||
                studentActivity.status === ActivityStatus.COMPLETED
              }
            >
              {isLoading
                ? "Enviando..."
                : studentActivity.status === ActivityStatus.COMPLETED
                ? "Actividad completada"
                : "Enviar respuesta"}
            </Button>
          </View>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
