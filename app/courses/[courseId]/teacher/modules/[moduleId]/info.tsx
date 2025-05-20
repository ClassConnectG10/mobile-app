import { View, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  Text,
  useTheme,
  Dialog,
  ActivityIndicator,
} from "react-native-paper";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { UserRole } from "@/types/course";
import { ModuleDetails } from "@/types/resources";
import {
  deleteCourseModule,
  getCourseModule,
  updateCourseModule,
} from "@/services/resourceManager";

export default function CreateCoursePage() {
  const theme = useTheme();
  const router = useRouter();

  const {
    courseId: courseIdParam,
    moduleId: moduleIdParam,
    userRole: userRoleParam,
  } = useLocalSearchParams();
  const courseId = courseIdParam as string;
  const moduleId = Number(moduleIdParam);
  const userRole = userRoleParam as UserRole;
  const isTeacher =
    userRole === UserRole.OWNER || userRole === UserRole.ASSISTANT;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");

  const [temporalModuleTitle, setTemporalModuleTitle] = useState("");
  const [temporalModuleDescription, setTemporalModuleDescription] =
    useState("");

  const fetchCourseModule = async () => {
    if (!courseId || !moduleId) return;
    setIsLoading(true);
    try {
      const module = await getCourseModule(courseId, moduleId);
      setModuleTitle(module.courseModuleDetails.title);
      setModuleDescription(module.courseModuleDetails.description);
      setTemporalModuleTitle(module.courseModuleDetails.title);
      setTemporalModuleDescription(module.courseModuleDetails.description);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardChanges = async () => {
    setTemporalModuleTitle(moduleTitle);
    setTemporalModuleDescription(moduleDescription);
    setIsEditing(false);
  };

  const handleEditModule = async () => {
    try {
      setIsLoading(true);
      const newModuleDetails = new ModuleDetails(
        temporalModuleTitle,
        temporalModuleDescription
      );
      await updateCourseModule(courseId, moduleId, newModuleDetails);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
      handleDiscardChanges();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = async () => {
    setIsLoading(true);
    try {
      await deleteCourseModule(courseId, moduleId);
      router.replace({
        pathname: "/courses/[courseId]",
        params: { courseId, role: userRole },
      });
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
      setShowConfirmationDelete(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourseModule();
    }, [courseId])
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={
              isEditing ? () => handleDiscardChanges() : () => router.back()
            }
          />
          <Appbar.Content title="Detalles del módulo" />
          {isTeacher && (
            <Appbar.Action
              icon={isEditing ? "check" : "pencil"}
              onPress={isEditing ? handleEditModule : () => setIsEditing(true)}
            />
          )}
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
                value={temporalModuleTitle}
                editable={isEditing}
                onChange={setTemporalModuleTitle}
              />
              <ToggleableTextInput
                label="Descripción"
                placeholder="Descripción"
                value={temporalModuleDescription}
                onChange={setTemporalModuleDescription}
                editable={isEditing}
              />
              {isEditing && isTeacher && (
                <Button
                  onPress={() => setShowConfirmationDelete(true)}
                  mode="contained"
                  icon="delete"
                  disabled={isLoading}
                >
                  Eliminar módulo
                </Button>
              )}
            </ScrollView>
          </View>
        )}
        <Dialog
          visible={showConfirmationDelete}
          onDismiss={() => setShowConfirmationDelete(false)}
        >
          <Dialog.Title>Atención</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              El módulo '{moduleTitle}' será eliminado JUNTO CON SUS RECURSOS Y
              ACTIVIDADES. ¿Está seguro de que desea continuar?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmationDelete(false)}>
              Cancelar
            </Button>
            <Button onPress={handleDeleteModule}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
