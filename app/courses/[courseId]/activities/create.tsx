import { DatePickerButton } from "@/components/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useActivityDetails } from "@/hooks/useActivityDetails";
import { createActivity } from "@/services/activityManagement";
import { globalStyles } from "@/styles/globalStyles";
import { ActivityType } from "@/types/activity";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function CreateActivity() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, activityType: activityTypeParam } =
    useLocalSearchParams();

  const [errorMessage, setErrorMessage] = useState("");

  const courseId = courseIdParam as string;
  const activityType = activityTypeParam as ActivityType;

  const activityDetailsHook = useActivityDetails();
  const activityDetails = activityDetailsHook.activityDetails;

  const handleCreateActivity = async () => {
    try {
      // Call the function to create the activity
      await createActivity(courseId, activityType, activityDetails);
      // Navigate to the course details page
      router.replace({
        pathname: "/courses/[courseId]",
        params: { courseId },
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
      console.error("Error al crear la actividad:", error);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Crear actividad" />
      </Appbar.Header>
      <View
        style={[
          globalStyles.mainContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ScrollView contentContainerStyle={globalStyles.courseDetailsContainer}>
          <TextInput
            placeholder="Nombre"
            value={activityDetails.title}
            onChangeText={activityDetailsHook.setTitle}
          />
          <TextInput
            placeholder="Descripción"
            value={activityDetails.description}
            onChangeText={activityDetailsHook.setDescription}
          />

          <TextInput
            placeholder="Instrucciones"
            value={activityDetails.instruction}
            onChangeText={activityDetailsHook.setInstruction}
          />

          <DatePickerButton
            label="Fecha límite"
            type="datetime"
            value={activityDetails.dueDate}
            onChange={activityDetailsHook.setDueDate}
          />

          <Button onPress={handleCreateActivity} mode="contained">
            Crear actividad
          </Button>
        </ScrollView>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
