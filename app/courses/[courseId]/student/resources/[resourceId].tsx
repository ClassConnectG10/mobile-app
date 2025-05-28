import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  useTheme,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { ToggleableLinkInput } from "@/components/forms/ToggleableLinkInput";
import { getResource } from "@/services/resourceManager";
import {
  AttachmentType,
  FileAttachment,
  LinkAttachment,
  Resource,
} from "@/types/resources";
import { TextField } from "@/components/forms/TextField";
import { File } from "@/types/file";

export default function EditResourcePage() {
  const theme = useTheme();
  const router = useRouter();
  const {
    courseId: courseIdParam,
    moduleId: moduleIdParam,
    resourceId: resourceIdParam,
  } = useLocalSearchParams();
  const courseId = courseIdParam as string;
  const moduleId = Number(moduleIdParam);
  const resourceId = Number(resourceIdParam);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estado original y temporal
  const [resource, setResource] = useState<Resource | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  async function fetchResource() {
    if (!courseId || !moduleId || !resourceId) return;
    setIsLoading(true);

    try {
      const fetchedResource = await getResource(courseId, moduleId, resourceId);
      setResource(fetchedResource);
      setFiles(
        fetchedResource.resourceDetails.attachments
          .filter(
            (attachment) => attachment.attachmentType === AttachmentType.FILE
          )
          .map((fileAttachment) => (fileAttachment as FileAttachment).file)
      );
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchResource();
    }, [courseId, moduleId, resourceId])
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Detalles del recurso" />
      </Appbar.Header>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: 16,
        }}
      >
        {isLoading || !resource ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ gap: 16 }}>
              <TextField
                label="Título"
                value={resource.resourceDetails.title}
              />
              <TextField
                label="Descripción"
                value={resource.resourceDetails.description}
              />
              <Divider />
              <ToggleableFileInput
                files={files}
                editable={false}
                onChange={setFiles}
              />
              <Divider />
              <ToggleableLinkInput
                links={resource.resourceDetails.attachments
                  .filter(
                    (attachment) =>
                      attachment.attachmentType === AttachmentType.LINK
                  )
                  .map(
                    (linkAttachment) => (linkAttachment as LinkAttachment).link
                  )}
                editable={false}
                onChange={() => {}}
              />
            </View>
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
