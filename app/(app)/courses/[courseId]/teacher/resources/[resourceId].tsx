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
import {
  deleteResource,
  getResource,
  updateResource,
} from "@/services/resourceManagment";
import { useResourceDetails } from "@/hooks/useResourceDetails";
import {
  AttachmentType,
  FileAttachment,
  LinkAttachment,
  Resource,
} from "@/types/resources";
import { getCourse } from "@/services/courseManagement";
import { Course, CourseStatus } from "@/types/course";

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

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estado original y temporal
  const [resource, setResource] = useState<Resource | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const temporalResourceDetailsHook = useResourceDetails();
  const temporalResourceDetails = temporalResourceDetailsHook.resourceDetails;

  const [temporalFilesAttachments, setTemporalFilesAttachments] = useState<
    FileAttachment[]
  >([]);
  const [temporalLinksAttachments, setTemporalLinksAttachments] = useState<
    LinkAttachment[]
  >([]);

  async function fetchResource() {
    if (!courseId || !moduleId || !resourceId) return;
    setIsLoading(true);

    try {
      const fetchedResource = await getResource(courseId, moduleId, resourceId);
      setResource(fetchedResource);
      temporalResourceDetailsHook.setResourceDetails({
        ...fetchedResource.resourceDetails,
      });
      console.log("Attachments:", fetchedResource.resourceDetails.attachments);
      setTemporalFilesAttachments(
        fetchedResource.resourceDetails.attachments
          ?.filter((a) => a.attachmentType === AttachmentType.FILE)
          .map((a) => a as FileAttachment) || []
      );
      setTemporalLinksAttachments(
        fetchedResource.resourceDetails.attachments
          ?.filter((a) => a.attachmentType === AttachmentType.LINK)
          .map((a) => a as LinkAttachment) || []
      );
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCourse() {
    try {
      setIsLoading(true);
      const fetchedCourse = await getCourse(courseId);
      setCourse(fetchedCourse);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    setIsLoading(true);

    try {
      await updateResource(
        courseId,
        moduleId,
        resourceId,
        temporalResourceDetails,
        resource.resourceDetails.attachments
      );
      setResource((prev) =>
        prev
          ? { ...prev, resourceDetails: { ...temporalResourceDetails } }
          : prev
      );
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDiscardChanges = () => {
    if (!resource) return;

    temporalResourceDetailsHook.setResourceDetails({
      ...resource.resourceDetails,
    });
    setTemporalFilesAttachments(
      resource.resourceDetails.attachments
        ?.filter((a) => a.attachmentType === AttachmentType.FILE)
        .map((a) => a as FileAttachment) || []
    );
    setTemporalLinksAttachments(
      resource.resourceDetails.attachments
        ?.filter((a) => a.attachmentType === AttachmentType.LINK)
        .map((a) => a as LinkAttachment) || []
    );
    setIsEditing(false);
  };

  const handleDeleteResource = async () => {
    setIsLoading(true);
    try {
      await deleteResource(courseId, moduleId, resourceId);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
      router.back();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchResource();
      fetchCourse();
    }, [courseId, moduleId, resourceId])
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={isEditing ? handleDiscardChanges : () => router.back()}
        />
        <Appbar.Content title="Detalles del recurso" />
        {course?.courseStatus !== CourseStatus.FINISHED && (
          <Appbar.Action
            icon={isEditing ? "check" : "pencil"}
            onPress={isEditing ? handleSave : handleEdit}
            disabled={isLoading}
          />
        )}
      </Appbar.Header>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: 16,
        }}
      >
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
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ gap: 16 }}>
              <ToggleableTextInput
                label="Título"
                placeholder="Título del recurso"
                value={temporalResourceDetails.title}
                onChange={temporalResourceDetailsHook.setTitle}
                editable={isEditing}
              />
              <ToggleableTextInput
                label="Descripción"
                placeholder="Descripción del recurso"
                value={temporalResourceDetails.description}
                onChange={temporalResourceDetailsHook.setDescription}
                editable={isEditing}
              />
              <Divider />
              <ToggleableFileInput
                files={temporalFilesAttachments.map(
                  (fileAttachment) => fileAttachment.file
                )}
                editable={isEditing}
                onChange={(files) => {
                  const newFileAttachments = files.map((file) => {
                    const existing = temporalFilesAttachments.find(
                      (a) =>
                        a.file === file ||
                        (a.file.firebaseUrl &&
                          a.file.firebaseUrl === file.firebaseUrl)
                    );
                    return existing
                      ? { ...existing, file }
                      : new FileAttachment(file);
                  });
                  setTemporalFilesAttachments(newFileAttachments);
                  temporalResourceDetailsHook.setAttachments([
                    ...newFileAttachments,
                    ...temporalLinksAttachments,
                  ]);
                }}
                maxFiles={5}
              />
              <Divider />
              <ToggleableLinkInput
                links={temporalLinksAttachments.map((link) => link.link)}
                editable={isEditing}
                onChange={(links) => {
                  const newAttachments = links.map(
                    (link) =>
                      temporalLinksAttachments.find((a) => a.link === link) ??
                      new LinkAttachment(link)
                  );
                  setTemporalLinksAttachments(newAttachments);
                  temporalResourceDetailsHook.setAttachments([
                    ...temporalFilesAttachments,
                    ...newAttachments,
                  ]);
                }}
                maxLinks={5}
              />
              {isEditing && course?.courseStatus !== CourseStatus.FINISHED && (
                <Button
                  mode="outlined"
                  onPress={handleDeleteResource}
                  disabled={isLoading}
                  icon="delete"
                >
                  Borrar recurso
                </Button>
              )}
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
