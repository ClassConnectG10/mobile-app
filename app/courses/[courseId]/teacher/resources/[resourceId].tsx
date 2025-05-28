import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  useTheme,
  ActivityIndicator,
  Dialog,
  Text,
  Divider,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { ToggleableLinkInput } from "@/components/forms/ToggleableLinkInput";
import {
  getResource,
  updateResource,
  deleteResource,
} from "@/services/resourceManager";
import { useResourceDetails } from "@/hooks/useResourceDetails";
import { FileAttachment, LinkAttachment, Resource } from "@/types/resources";

export default function ResourceInfoPage() {
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
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);

  const resourceDetailsHook = useResourceDetails();
  const resourceDetails = resourceDetailsHook.resourceDetails;

  const [filesAttachments, setFilesAttachments] = useState<FileAttachment[]>(
    [],
  );
  const [linksAttachments, setLinksAttachments] = useState<LinkAttachment[]>(
    [],
  );

  // Cargar el recurso
  const fetchResource = useCallback(async () => {
    if (!courseId || !moduleId || !resourceId) return;
    setIsLoading(true);
    try {
      const fetchedResource: Resource = await getResource(
        courseId,
        moduleId,
        resourceId,
      );
      resourceDetailsHook.setResourceDetails({
        title: fetchedResource.ResourceDetails.title,
        description: fetchedResource.ResourceDetails.description,
        moduleId: fetchedResource.ResourceDetails.moduleId,
        attachments: fetchedResource.ResourceDetails.attachments || [],
      });
      //   setFilesAttachments(
      //     (fetchedResource.ResourceDetails.attachments || []).filter(
      //       (a) => a.type === "FILE",
      //     ),
      //   );
      //   setLinksAttachments(
      //     (fetchedResource.ResourceDetails.attachments || []).filter(
      //       (a) => a.type === "LINK",
      //     ),
      //   );
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, moduleId, resourceId]);

  useEffect(() => {
    fetchResource();
  }, [fetchResource]);

  // Guardar cambios
  const handleEditResource = async () => {
    setIsLoading(true);
    try {
      await updateResource(courseId, moduleId, resourceId, resourceDetails, []);
      setIsEditing(false);
      fetchResource();
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Descartar cambios
  const handleDiscardChanges = () => {
    fetchResource();
    setIsEditing(false);
  };

  // Eliminar recurso
  const handleDeleteResource = async () => {
    setIsLoading(true);
    try {
      await deleteResource(courseId, moduleId, resourceId);
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
      setShowConfirmationDelete(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={isEditing ? handleDiscardChanges : () => router.back()}
        />
        <Appbar.Content title="Recurso" />
        <Appbar.Action
          icon={isEditing ? "check" : "pencil"}
          onPress={isEditing ? handleEditResource : () => setIsEditing(true)}
        />
      </Appbar.Header>
      {isLoading ? (
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
        <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
          <ToggleableTextInput
            label="Título"
            placeholder="Título del recurso"
            value={resourceDetails.title}
            onChange={resourceDetailsHook.setTitle}
            editable={isEditing}
          />
          <ToggleableTextInput
            label="Descripción"
            placeholder="Descripción del recurso"
            value={resourceDetails.description}
            onChange={resourceDetailsHook.setDescription}
            editable={isEditing}
          />
          <Divider />
          <ToggleableFileInput
            files={filesAttachments.map((file) => file.file)}
            editable={isEditing}
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
            editable={isEditing}
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
          {isEditing && (
            <Button
              mode="contained"
              icon="delete"
              onPress={() => setShowConfirmationDelete(true)}
              disabled={isLoading}
              style={{ marginTop: 16 }}
            >
              Eliminar recurso
            </Button>
          )}
        </ScrollView>
      )}
      <Dialog
        visible={showConfirmationDelete}
        onDismiss={() => setShowConfirmationDelete(false)}
      >
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            El recurso '{resourceDetails.title}' será eliminado.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationDelete(false)}>
            Cancelar
          </Button>
          <Button onPress={handleDeleteResource}>Eliminar</Button>
        </Dialog.Actions>
      </Dialog>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
