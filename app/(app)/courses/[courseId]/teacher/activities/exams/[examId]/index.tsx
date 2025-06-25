import { AlertText } from "@/components/AlertText";
import { DatePickerButton } from "@/components/forms/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import {
  deleteExam,
  getTeacherExam,
  publishExam,
  updateExam,
} from "@/services/activityManagement";
import { getCourse } from "@/services/courseManagement";
import { ExamDetails, TeacherActivity } from "@/types/activity";
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
import { useExamDetails } from "@/hooks/useExamDetails";

export default function TeacherExamPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, examId: examIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const examId = examIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherExam, setTeacherExam] = useState<TeacherActivity | null>(null);

  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);
  const [showConfirmationPublish, setShowConfirmationPublish] = useState(false);

  const examDetailsHook = useExamDetails();
  const examDetails = examDetailsHook.examDetails;

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

  async function fetchTeacherExam() {
    try {
      setIsLoading(true);
      if (courseId && examId) {
        const teacherExam = await getTeacherExam(courseId, Number(examId));
        setTeacherExam(teacherExam);
        examDetailsHook.setExamDetails(
          teacherExam.activity.activityDetails as ExamDetails
        );
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDiscardChanges = () => {
    if (teacherExam) {
      examDetailsHook.setExamDetails({
        ...(teacherExam.activity.activityDetails as ExamDetails),
      });
    }
    setIsEditing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeacherExam();
      fetchCourse();
    }, [courseId, examId])
  );

  const handleViewSubmissions = async () => {
    router.push({
      pathname:
        "/courses/[courseId]/teacher/activities/exams/[examId]/submissions",
      params: {
        courseId: courseId,
        examId: examId,
      },
    });
  };

  const handleEditExam = async () => {
    setIsLoading(true);

    try {
      if (teacherExam) {
        await updateExam(courseId, Number(examId), examDetails);
        setTeacherExam({
          ...teacherExam,
          activity: {
            ...teacherExam.activity,
            activityDetails: examDetails,
          },
        });
        setIsEditing(false);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
      handleDiscardChanges();
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuestions = async () => {
    router.push({
      pathname:
        "/courses/[courseId]/teacher/activities/exams/[examId]/questions",
      params: {
        courseId: courseId,
        examId: examId,
      },
    });
  };

  const handlePublishExam = async () => {
    setIsLoading(true);

    try {
      if (teacherExam) {
        await publishExam(courseId, Number(examId));
        setTeacherExam({
          ...teacherExam,
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

  const handleDeleteExam = async () => {
    setIsLoading(true);

    try {
      if (teacherExam) {
        await deleteExam(courseId, Number(examId));
        setTeacherExam(null);
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
          title={isEditing ? "Editando examen" : "Información del examen"}
        />
        {teacherExam &&
          !teacherExam.visible &&
          course.courseStatus !== CourseStatus.FINISHED && (
            <Appbar.Action
              icon={isEditing ? "check" : "pencil"}
              onPress={isEditing ? handleEditExam : () => setIsEditing(true)}
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
              placeholder="Nombre del examen"
              value={examDetails.title}
              editable={isEditing}
              onChange={examDetailsHook.setTitle}
            />
            <ToggleableTextInput
              label="Instrucciones"
              placeholder="Instrucciones del examen"
              value={examDetails.instructions}
              onChange={examDetailsHook.setInstructions}
              editable={isEditing}
            />
            <DatePickerButton
              label="Fecha límite"
              type="datetime"
              value={examDetails.dueDate}
              editable={isEditing}
              onChange={examDetailsHook.setDueDate}
            />

            {!isEditing && (
              <Button
                onPress={handleViewQuestions}
                mode="contained"
                icon="help-circle-outline"
              >
                Ver Preguntas
              </Button>
            )}
          </View>

          <View
            style={{
              gap: 16,
            }}
          >
            {!isEditing && teacherExam && teacherExam.visible && (
              <Button
                onPress={handleViewSubmissions}
                mode="contained"
                icon="clipboard-check"
              >
                Ver Entregas
              </Button>
            )}

            {!isEditing &&
              teacherExam &&
              !teacherExam.visible &&
              course.courseStatus !== CourseStatus.FINISHED && (
                <Button
                  onPress={() => setShowConfirmationPublish(true)}
                  mode="contained"
                  disabled={
                    isLoading || course.courseStatus !== CourseStatus.STARTED
                  }
                  icon="file-eye"
                >
                  Publicar examen
                </Button>
              )}

            {!isEditing &&
              course.courseStatus === CourseStatus.NEW &&
              course.currentUserRole === UserRole.OWNER && (
                <View style={{ gap: 16 }}>
                  <AlertText
                    text={
                      "El curso no ha sido iniciado y el examen no se puede publicar. Inicia el curso para poder publicar el examen."
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
                    "El curso no ha sido iniciado. Solicita al propietario del curso que lo Inicia para poder publicar el examen."
                  }
                  error={false}
                />
              )}

            {isEditing && course.courseStatus !== CourseStatus.FINISHED && (
              <Button
                onPress={() => setShowConfirmationDelete(true)}
                mode="contained"
                disabled={isLoading}
                icon="delete"
              >
                Borrar examen
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
            El examen '{examDetails.title}' será publicado.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationPublish(false)}>
            Cancelar
          </Button>
          <Button onPress={handlePublishExam}>Publicar</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={showConfirmationDelete}
        onDismiss={() => setShowConfirmationDelete(false)}
      >
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            El examen '{examDetails.title}' será eliminado.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationDelete(false)}>
            Cancelar
          </Button>
          <Button onPress={handleDeleteExam}>Eliminar</Button>
        </Dialog.Actions>
      </Dialog>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
