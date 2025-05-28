import { AlertText } from "@/components/AlertText";
import { DatePickerButton } from "@/components/forms/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import {
  deleteTask,
  deleteTaskFile,
  getTeacherTask,
  publishTask,
  updateTask,
  uploadTaskFile,
} from "@/services/activityManagement";
import { getCourse } from "@/services/courseManagement";
import { TaskDetails, TeacherActivity } from "@/types/activity";
import { Course, CourseStatus, UserRole } from "@/types/course";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Text,
  useTheme,
  Button,
  Dialog,
} from "react-native-paper";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { File } from "@/types/file";
import { set } from "zod";

export default function TeacherExamPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, taskId: taskIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const taskId = taskIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherTask, setTeacherTask] = useState<TeacherActivity | null>(null);
  const [taskFiles, setTaskFiles] = useState<File[]>([]);
  const [taskFilesChanged, setTaskFilesChanged] = useState(false);
  const [taskFilesDeleted, setTaskFilesDeleted] = useState(false);

  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);
  const [showConfirmationPublish, setShowConfirmationPublish] = useState(false);

  const [course, setCourse] = useState<Course | null>(null);

  const taskDetailsHook = useTaskDetails();
  const taskDetails = taskDetailsHook.taskDetails;

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

  async function fetchTeacherTask() {
    try {
      setIsLoading(true);
      if (courseId && taskId) {
        const teacherTask = await getTeacherTask(courseId, Number(taskId));
        setTeacherTask(teacherTask);
        taskDetailsHook.setTaskDetails(
          teacherTask.activity.activityDetails as TaskDetails
        );
        setTaskFiles(
          (teacherTask.activity.activityDetails as TaskDetails).instructionsFile
            ? [
                (teacherTask.activity.activityDetails as TaskDetails)
                  .instructionsFile,
              ]
            : []
        );
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleTaskFilesChange = (files: File[]) => {
    setTaskFiles(files);
    setTaskFilesChanged(true);
    setTaskFilesDeleted(files.length === 0);
  };

  const handleDiscardChanges = () => {
    if (teacherTask) {
      taskDetailsHook.setTaskDetails(
        teacherTask.activity.activityDetails as TaskDetails
      );
    }
    setIsEditing(false);
    setTaskFiles([
      (teacherTask?.activity.activityDetails as TaskDetails)
        .instructionsFile as File,
    ]);
    setTaskFilesChanged(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeacherTask();
      fetchCourse();
    }, [courseId, taskId])
  );

  const handleViewSubmissions = async () => {
    router.push({
      pathname:
        "/courses/[courseId]/teacher/activities/tasks/[taskId]/submissions",
      params: {
        courseId: courseId,
        taskId: taskId,
      },
    });
  };

  const handleEditTask = async () => {
    setIsLoading(true);

    try {
      if (teacherTask) {
        await updateTask(courseId, Number(taskId), taskDetails);
        setTeacherTask({
          ...teacherTask,
          activity: {
            ...teacherTask.activity,
            activityDetails: taskDetails,
          },
        });
        if (taskFilesChanged) {
          console.log("taskFiles fffff", taskFiles);
          if (!taskFilesDeleted) {
            await uploadTaskFile(courseId, Number(taskId), taskFiles[0]);
          } else {
            console.log("AAAASDSD");
            await deleteTaskFile(courseId, Number(taskId));
          }
          setTaskFilesChanged(false);
        }
        setIsEditing(false);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
      handleDiscardChanges();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishTask = async () => {
    setIsLoading(true);

    try {
      if (teacherTask) {
        await publishTask(courseId, Number(taskId));
        setTeacherTask({
          ...teacherTask,
          visible: true,
        });
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setShowConfirmationPublish(false);
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    setIsLoading(true);

    try {
      if (teacherTask) {
        await deleteTask(courseId, Number(taskId));
        setTeacherTask(null);
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
        <Appbar.Content
          title={isEditing ? "Editado tarea" : "Información de la tarea"}
        />
        {teacherTask && !teacherTask.visible && (
          <Appbar.Action
            icon={isEditing ? "check" : "pencil"}
            onPress={isEditing ? handleEditTask : () => setIsEditing(true)}
          />
        )}
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
            <ToggleableTextInput
              label="Nombre"
              placeholder="Nombre de la tarea"
              value={taskDetails.title}
              editable={isEditing}
              onChange={taskDetailsHook.setTitle}
            />
            <ToggleableTextInput
              label="Instrucciones"
              placeholder="Instrucciones de la tarea"
              value={taskDetails.instructions}
              onChange={taskDetailsHook.setInstructions}
              editable={isEditing}
            />
            <DatePickerButton
              label="Fecha límite"
              type="datetime"
              value={taskDetails.dueDate}
              editable={isEditing}
              onChange={taskDetailsHook.setDueDate}
            />

            <ToggleableFileInput
              files={taskFiles}
              editable={isEditing}
              onChange={handleTaskFilesChange}
              maxFiles={1}
            />
          </View>

          <View
            style={{
              gap: 16,
            }}
          >
            {!isEditing && teacherTask && teacherTask.visible && (
              <Button
                onPress={handleViewSubmissions}
                mode="contained"
                icon="clipboard-check"
              >
                Ver Entregas
              </Button>
            )}

            {!isEditing && teacherTask && !teacherTask.visible && (
              <Button
                onPress={() => setShowConfirmationPublish(true)}
                mode="contained"
                disabled={
                  isLoading || course.courseStatus !== CourseStatus.STARTED
                }
                icon="file-eye"
              >
                Publicar tarea
              </Button>
            )}

            {!isEditing &&
              course.courseStatus === CourseStatus.NEW &&
              course.currentUserRole === UserRole.OWNER && (
                <View style={{ gap: 16 }}>
                  <AlertText
                    text={
                      "El curso no ha sido iniciado y la tarea no se puede publicar. Inicia el curso para poder publicar la tarea."
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
                    "El curso no ha sido iniciado. Solicita al propietario del curso que lo Inicia para poder publicar la tarea."
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
                Borrar tarea
              </Button>
            )}
          </View>
        </ScrollView>
      )}
      <Dialog
        visible={showConfirmationPublish}
        onDismiss={() => setShowConfirmationPublish(false)}
      >
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            La tarea '{taskDetails.title}' será publicada.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationPublish(false)}>
            Cancelar
          </Button>
          <Button onPress={handlePublishTask}>Publicar</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={showConfirmationDelete}
        onDismiss={() => setShowConfirmationDelete(false)}
      >
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            la tarea '{taskDetails.title}' será eliminada.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationDelete(false)}>
            Cancelar
          </Button>
          <Button onPress={handleDeleteTask}>Eliminar</Button>
        </Dialog.Actions>
      </Dialog>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
