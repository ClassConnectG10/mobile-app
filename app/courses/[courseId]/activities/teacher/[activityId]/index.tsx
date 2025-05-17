import { AlertText } from "@/components/AlertText";
import { DatePickerButton } from "@/components/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/ToggleableTextInput";
import { useActivityDetails } from "@/hooks/useActivityDetails";
import {
  deleteActivity,
  getTeacherActivity,
  postActivity,
  updateActivity,
} from "@/services/activityManagement";
import { getCourse } from "@/services/courseManagement";
import { TeacherActivity } from "@/types/activity";
import { Course, CourseStatus, UserRole } from "@/types/course";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Text,
  useTheme,
  Button,
  Dialog,
} from "react-native-paper";

export default function TeacherActivityPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, activityId: activityIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const activityId = activityIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherActivity, setTeacherActivity] =
    useState<TeacherActivity | null>(null);

  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);
  const [showConfirmationPublish, setShowConfirmationPublish] = useState(false);

  const activityDetailsHook = useActivityDetails();
  const activityDetails = activityDetailsHook.activityDetails;

  const [course, setCourse] = useState<Course | null>(null);

  async function fetchCourse() {
    if (!courseId) return;
    setIsLoading(true);

    try {
      const fetchedCourse = await getCourse(courseId);
      setCourse(fetchedCourse);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTeacherActivity() {
    try {
      setIsLoading(true);
      if (courseId && activityId) {
        const activity = await getTeacherActivity(courseId, Number(activityId));
        setTeacherActivity(activity);
        activityDetailsHook.setActivityDetails(
          activity.activity.activityDetails,
        );
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDiscardChanges = () => {
    if (teacherActivity) {
      activityDetailsHook.setActivityDetails({
        ...teacherActivity.activity.activityDetails,
      });
    }
    setIsEditing(false);
  };

  useEffect(() => {
    fetchTeacherActivity();
    fetchCourse();
  }, [courseId, activityId]);

  const handleViewSubmissions = async () => {
    router.push({
      pathname:
        "/courses/[courseId]/activities/teacher/[activityId]/submissions",
      params: {
        courseId: courseId,
        activityId: activityId,
      },
    });
  };

  const handleEditActivity = async () => {
    setIsLoading(true);

    try {
      if (teacherActivity) {
        const updatedActivity = await updateActivity(
          courseId,
          teacherActivity.activity,
          activityDetails,
        );
        setTeacherActivity(updatedActivity);
        setIsEditing(false);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
      handleDiscardChanges();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishActivity = async () => {
    setIsLoading(true);

    try {
      if (teacherActivity) {
        const updatedActivity = await postActivity(
          courseId,
          teacherActivity.activity,
        );
        setTeacherActivity(updatedActivity);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setShowConfirmationPublish(false);
      setIsLoading(false);
    }
  };

  const handleDeleteActivity = async () => {
    setIsLoading(true);

    try {
      if (teacherActivity) {
        await deleteActivity(courseId, teacherActivity.activity);
        setTeacherActivity(null);
        router.back();
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setShowConfirmationDelete(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={
            isEditing ? () => handleDiscardChanges() : () => router.back()
          }
        />
        <Appbar.Content title={"Información de la actividad"} />
        <Appbar.Action
          icon={isEditing ? "check" : "pencil"}
          onPress={isEditing ? handleEditActivity : () => setIsEditing(true)}
        />
      </Appbar.Header>
      {isLoading || !course ? (
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
        <View
          style={{
            padding: 16,
            gap: 16,
            flex: 1,
          }}
        >
          <ToggleableTextInput
            label="Nombre"
            placeholder="Nombre de la actividad"
            value={activityDetails.title}
            editable={isEditing}
            onChange={activityDetailsHook.setTitle}
          />
          <ToggleableTextInput
            label="Descripción"
            placeholder="Descripción de la actividad"
            value={activityDetails.description}
            onChange={activityDetailsHook.setDescription}
            editable={isEditing}
          />
          <ToggleableTextInput
            label="Instrucciones"
            placeholder="Instrucciones de la actividad"
            value={activityDetails.instruction}
            onChange={activityDetailsHook.setInstruction}
            editable={isEditing}
          />
          <DatePickerButton
            label="Fecha límite"
            type="datetime"
            value={activityDetails.dueDate}
            editable={isEditing}
            onChange={activityDetailsHook.setDueDate}
          />

          {!isEditing && teacherActivity && teacherActivity.visible && (
            <Button
              onPress={handleViewSubmissions}
              mode="contained"
              icon="clipboard-check"
            >
              Ver Entregas
            </Button>
          )}

          {!isEditing && teacherActivity && !teacherActivity.visible && (
            <Button
              onPress={() => setShowConfirmationPublish(true)}
              mode="contained"
              disabled={
                isLoading || course.courseStatus !== CourseStatus.STARTED
              }
              icon="file-eye"
            >
              Publicar actividad
            </Button>
          )}

          {!isEditing &&
            course.courseStatus === CourseStatus.NEW &&
            course.currentUserRole === UserRole.OWNER && (
              <View style={{ gap: 16 }}>
                <AlertText
                  text={
                    "El curso no ha sido iniciado y la actividad no se puede publicar. Inicia el curso para poder publicar la actividad."
                  }
                  error={false}
                />
                <Button
                  onPress={() => {
                    router.push({
                      pathname: "/courses/[courseId]/info",
                      params: {
                        courseId,
                      },
                    });
                  }}
                  mode="contained"
                  icon="cog"
                  disabled={isLoading}
                >
                  Ir a configuración del curso
                </Button>
              </View>
            )}

          {!isEditing &&
            course.courseStatus === CourseStatus.NEW &&
            course.currentUserRole === UserRole.ASSISTANT && (
              <AlertText
                text={
                  "El curso no ha sido iniciado. Solicita al propietario del curso que lo Inicia para poder publicar la actividad."
                }
                error={false}
              />
            )}

          {isEditing && (
            <Button
              onPress={() => setShowConfirmationDelete(true)}
              mode="contained"
              disabled={isLoading}
              icon="delete"
            >
              Borrar actividad
            </Button>
          )}
        </View>
      )}
      <Dialog
        visible={showConfirmationPublish}
        onDismiss={() => setShowConfirmationPublish(false)}
      >
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            La actividad '{activityDetails.title}' será publicada.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationPublish(false)}>
            Cancelar
          </Button>
          <Button onPress={handlePublishActivity}>Publicar</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={showConfirmationDelete}
        onDismiss={() => setShowConfirmationDelete(false)}
      >
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            La actividad '{activityDetails.title}' será eliminada.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationDelete(false)}>
            Cancelar
          </Button>
          <Button onPress={handleDeleteActivity}>Eliminar</Button>
        </Dialog.Actions>
      </Dialog>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
