import { DatePickerButton } from "@/components/forms/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { createTask, uploadTaskFile } from "@/services/activityManagement";
import { globalStyles } from "@/styles/globalStyles";
import { ActivityType } from "@/types/activity";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import { Appbar, Button, TextInput, useTheme } from "react-native-paper";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import OptionPicker from "@/components/forms/OptionPicker";
import { BiMap } from "@/utils/bimap";
import { getCourseModules } from "@/services/resourceManager";
import { AlertText } from "@/components/AlertText";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { File } from "@/types/file";

export default function CreateTaskPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, activityType: activityTypeParam } =
    useLocalSearchParams();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courseModulesBiMap, setCourseModulesBiMap] = useState<BiMap>(
    new BiMap()
  );
  const [taskFiles, setTaskFiles] = useState<File[]>([]);

  const courseId = courseIdParam as string;

  // const activityDetailsHook = useTaskDetails();
  // const activityDetails = activityDetailsHook.taskDetails;

  const taskDetailsHook = useTaskDetails();
  const taskDetails = taskDetailsHook.taskDetails;

  const fetchCourseModules = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const courseModules = await getCourseModules(courseId);
      const bimap = new BiMap(
        courseModules.map((module) => [
          module.courseModuleDetails.title,
          module.moduleId.toString(),
        ])
      );
      setCourseModulesBiMap(bimap);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    setIsLoading(true);
    try {
      const createdTaskId = await createTask(courseId, taskDetails);
      if (taskFiles.length > 0) {
        await uploadTaskFile(courseId, createdTaskId, taskFiles[0]);
      }

      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourseModules();
    }, [courseId])
  );

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
            value={taskDetails.title}
            onChangeText={taskDetailsHook.setTitle}
          />

          <TextInput
            placeholder="Instrucciones"
            value={taskDetails.instructions}
            onChangeText={taskDetailsHook.setInstructions}
          />

          <DatePickerButton
            label="Fecha límite"
            type="datetime"
            value={taskDetails.dueDate}
            onChange={taskDetailsHook.setDueDate}
          />

          <OptionPicker
            label="Módulo"
            value={taskDetails.moduleId?.toString()}
            items={courseModulesBiMap}
            setValue={(newValue: string) => {
              taskDetailsHook.setModuleId(Number(newValue));
            }}
          />
          {courseModulesBiMap.isEmpty() && !isLoading && (
            <>
              <AlertText
                text="Antes de crear un examen, debe crear un módulo"
                error={false}
              />
              <Button
                onPress={() =>
                  router.push({
                    pathname: "/courses/[courseId]/teacher/modules/create",
                    params: { courseId },
                  })
                }
                icon="book-plus"
                mode="contained"
                disabled={isLoading}
              >
                Crear módulo
              </Button>
            </>
          )}

          <ToggleableFileInput
            files={taskFiles}
            editable={true}
            onChange={setTaskFiles}
            maxFiles={1}
          />

          <Button
            onPress={handleCreateTask}
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
