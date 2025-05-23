import { DatePickerButton } from "@/components/forms/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { createTask, uploadTaskFile } from "@/services/activityManagement";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import OptionPicker from "@/components/forms/OptionPicker";
import { BiMap } from "@/utils/bimap";
import { getModules } from "@/services/resourceManager";
import { AlertText } from "@/components/AlertText";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { File } from "@/types/file";

export default function CreateTaskPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam } = useLocalSearchParams();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courseModulesBiMap, setCourseModulesBiMap] = useState<BiMap>(
    new BiMap(),
  );
  const [taskFiles, setTaskFiles] = useState<File[]>([]);

  const courseId = courseIdParam as string;

  const taskDetailsHook = useTaskDetails();
  const taskDetails = taskDetailsHook.taskDetails;

  const fetchCourseModules = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const courseModules = await getModules(courseId);
      const bimap = new BiMap(
        courseModules.map((module) => [
          module.courseModuleDetails.title,
          module.moduleId.toString(),
        ]),
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
    }, [courseId]),
  );

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={"Nueva tarea"} />
        </Appbar.Header>
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              justifyContent: "space-between",
              flex: 1,
            }}
          >
            <View
              style={{
                gap: 16,
              }}
            >
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
                    text="Antes de crear una tarea, debe crear un módulo"
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

              <Divider />

              <ToggleableFileInput
                files={taskFiles}
                editable={true}
                onChange={setTaskFiles}
                maxFiles={1}
              />
            </View>

            <View>
              <Button
                onPress={handleCreateTask}
                mode="contained"
                disabled={isLoading || courseModulesBiMap.isEmpty()}
              >
                Crear tarea
              </Button>
            </View>
          </ScrollView>
        )}

        <ErrorMessageSnackbar
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      </View>
    </>
  );
}
