import { View, ScrollView } from "react-native";
import { Appbar, useTheme, ActivityIndicator } from "react-native-paper";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { getModule } from "@/services/resourceManagment";

export default function CreateCoursePage() {
  const theme = useTheme();
  const router = useRouter();

  const { courseId: courseIdParam, moduleId: moduleIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const moduleId = Number(moduleIdParam);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");

  const fetchCourseModule = async () => {
    if (!courseId || !moduleId) return;
    setIsLoading(true);
    try {
      const module = await getModule(courseId, moduleId);
      setModuleTitle(module.courseModuleDetails.title);
      setModuleDescription(module.courseModuleDetails.description);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourseModule();
    }, [courseId]),
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              router.back();
            }}
          />
          <Appbar.Content title="Detalles del módulo" />
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
          <View style={{ padding: 16 }}>
            <ScrollView contentContainerStyle={{ gap: 16 }}>
              <ToggleableTextInput
                label="Nombre"
                placeholder="Nombre"
                value={moduleTitle}
                editable={false}
                onChange={setModuleTitle}
              />
              <ToggleableTextInput
                label="Descripción"
                placeholder="Descripción"
                value={moduleDescription}
                onChange={setModuleDescription}
                editable={false}
              />
            </ScrollView>
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
