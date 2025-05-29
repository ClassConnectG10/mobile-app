import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  useTheme,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { ToggleableLinkInput } from "@/components/forms/ToggleableLinkInput";
import { createResource } from "@/services/resourceManager";
import { useResourceDetails } from "@/hooks/useResourceDetails";
import { FileAttachment, LinkAttachment } from "@/types/resources";

export default function CreateResourcePage() {
  const theme = useTheme();
  const router = useRouter();
  const { courseId: courseIdParam, moduleId: moduleIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const moduleId = Number(moduleIdParam);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const resourceDetailsHook = useResourceDetails();
  const resourceDetails = resourceDetailsHook.resourceDetails;

  const [filesAttachments, setFilesAttachments] = useState<FileAttachment[]>(
    [],
  );
  const [linksAttachments, setLinksAttachments] = useState<LinkAttachment[]>(
    [],
  );

  const handleCreateResource = async () => {
    setIsLoading(true);
    try {
      await createResource(courseId, moduleId, resourceDetails);
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
        <Appbar.Content title="Crear recurso" />
      </Appbar.Header>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: 16,
        }}
      >
        {isLoading ? (
          <View style={{ flex: 1 }}>
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ gap: 16 }}>
                <ToggleableTextInput
                  label="Título"
                  placeholder="Título del recurso"
                  value={resourceDetails.title}
                  onChange={resourceDetailsHook.setTitle}
                  editable={true}
                />
                <ToggleableTextInput
                  label="Descripción"
                  placeholder="Descripción del recurso"
                  value={resourceDetails.description}
                  onChange={resourceDetailsHook.setDescription}
                  editable={true}
                />
                <Divider />
                <ToggleableFileInput
                  files={filesAttachments.map((file) => file.file)}
                  editable={true}
                  onChange={(files) => {
                    const newAttachments = files.map(
                      (file) => new FileAttachment(file),
                    );
                    setFilesAttachments(newAttachments);
                    resourceDetailsHook.setAttachments([
                      ...newAttachments,
                      ...linksAttachments,
                    ]);
                  }}
                  maxFiles={5}
                />
                <Divider />
                <ToggleableLinkInput
                  links={linksAttachments.map((link) => link.link)}
                  editable={true}
                  onChange={(links) => {
                    const newAttachments = links.map(
                      (link) => new LinkAttachment(link),
                    );
                    setLinksAttachments(newAttachments);
                    resourceDetailsHook.setAttachments([
                      ...filesAttachments,
                      ...newAttachments,
                    ]);
                  }}
                  maxLinks={5}
                />
              </View>
            </ScrollView>
            <View style={{ paddingTop: 8 }}>
              <Button
                mode="contained"
                onPress={handleCreateResource}
                disabled={isLoading}
              >
                Crear recurso
              </Button>
            </View>
          </>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
