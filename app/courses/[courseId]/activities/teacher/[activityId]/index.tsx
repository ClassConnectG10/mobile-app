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
import { TeacherActivity } from "@/types/activity";
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

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherActivity, setTeacherActivity] =
    useState<TeacherActivity | null>(null);

  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);

  const [showConfirmationPublish, setShowConfirmationPublish] = useState(false);

  const activityDetailsHook = useActivityDetails();
  const activityDetails = activityDetailsHook.activityDetails;

  async function fetchTeacherActivity() {
    try {
      setIsLoading(true);
      console.log("Cargando actividad de docente");
      console.log("CourseID: ", courseId);
      console.log("ActivityID: ", activityId);
      if (courseId && activityId) {
        const activity = await getTeacherActivity(courseId, Number(activityId));
        console.log("Actividad de docente", activity);
        setTeacherActivity(activity);
        activityDetailsHook.setActivityDetails(
          activity.activity.activityDetails
        );
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDiscardChanges = () => {
    console.log("Descartando cambios");
    if (teacherActivity) {
      activityDetailsHook.setActivityDetails({
        ...teacherActivity.activity.activityDetails,
      });
    }
    setIsEditing(false);
  };

  useEffect(() => {
    fetchTeacherActivity();
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
    try {
      setIsLoading(true);
      console.log("Guardando cambios de actividad");
      if (teacherActivity) {
        const updatedActivity = await updateActivity(
          courseId,
          teacherActivity.activity,
          activityDetails
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
    try {
      setIsLoading(true);
      console.log("Publicando actividad");
      if (teacherActivity) {
        const updatedActivity = await postActivity(
          courseId,
          teacherActivity.activity
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
    try {
      setIsLoading(true);
      console.log("Borrando actividad");
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
        <View
          style={{
            padding: 16,
            gap: 16,
            flex: 1,
          }}
        >
          {/* <FlatList
              style={styles.scrollContainer}
              data={studentSubmissions}
              keyExtractor={(item) => item.resourceId}
              renderItem={({ item }) => <SubmissionCard submission={item} />}
              ListHeaderComponent={() => <TeacherActivityHeader />}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            /> */}

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

          {!isEditing && (
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
              disabled={isLoading}
              icon="file-eye"
            >
              Publicar actividad
            </Button>
          )}

          {!isEditing && (
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
