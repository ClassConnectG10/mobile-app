import { DatePickerButton } from "@/components/forms/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { useExamDetails } from "@/hooks/useExamDetails";
import { createActivity } from "@/services/activityManagement";
import { getCourseModuleId } from "@/services/activityManagement";
import { globalStyles } from "@/styles/globalStyles";
import { ActivityType } from "@/types/activity";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Appbar, Button, TextInput, useTheme } from "react-native-paper";
import { useTaskDetails } from "@/hooks/useTaskDetails";

export default function CreateActivity() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, activityType: activityTypeParam } =
    useLocalSearchParams();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const courseId = courseIdParam as string;
  const activityType = activityTypeParam as ActivityType;

  const activityDetailsHook = useTaskDetails();
  const activityDetails = activityDetailsHook.activityDetails;

  const handleCreateActivity = async () => {
    setIsLoading(true);
    try {
      const moduleId = await getCourseModuleId(courseId);
      await createActivity(courseId, moduleId, activityType, activityDetails);
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Nueva tarea"} />
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
            placeholder="Instrucciones"
            value={activityDetails.instructions}
            onChangeText={activityDetailsHook.setInstructions}
          />

          <DatePickerButton
            label="Fecha límite"
            type="datetime"
            value={activityDetails.dueDate}
            onChange={activityDetailsHook.setDueDate}
          />

          <Button
            onPress={handleCreateActivity}
            mode="contained"
            disabled={isLoading}
          >
            Crear tarea
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
