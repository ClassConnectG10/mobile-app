import { View, ScrollView } from "react-native";
import { Appbar, Button, TextInput, useTheme } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { globalStyles } from "@/styles/globalStyles";
import { ModuleDetails } from "@/types/resources";
import { useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { createCourseModule } from "@/services/resourceManager";

export default function CreateModulePage() {
  const theme = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateModule = async () => {
    try {
      setIsLoading(true);
      const courseModuleDetails = new ModuleDetails(
        moduleTitle,
        moduleDescription
      );
      await createCourseModule(courseId, courseModuleDetails);
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
        <Appbar.Content title="Crear módulo" />
      </Appbar.Header>
      <View
        style={[
          globalStyles.mainContainer,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <ScrollView contentContainerStyle={globalStyles.courseDetailsContainer}>
          <TextInput
            placeholder="Nombre"
            label="Nombre"
            onChangeText={setModuleTitle}
          />
          <TextInput
            placeholder="Descripción"
            label="Descripción"
            onChangeText={setModuleDescription}
          />
        </ScrollView>
        <Button
          mode="contained"
          disabled={isLoading}
          onPress={handleCreateModule}
        >
          Crear módulo
        </Button>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
