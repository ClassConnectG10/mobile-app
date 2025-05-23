import { View, ScrollView } from "react-native";
import { Appbar, Button, TextInput, useTheme } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ModuleDetails } from "@/types/resources";
import { useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { createModule } from "@/services/resourceManager";

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
        moduleDescription,
      );
      await createModule(courseId, courseModuleDetails);
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
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <View
          style={{
            gap: 16,
          }}
        >
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
        </View>
        <View>
          <Button
            mode="contained"
            disabled={isLoading}
            onPress={handleCreateModule}
          >
            Crear módulo
          </Button>
        </View>
      </ScrollView>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
