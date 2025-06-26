import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  autocorrectTask,
  getTaskAutocorrection,
  getTaskGrade,
  getTaskSubmission,
  getTeacherTask,
  gradeTask,
} from "@/services/activityManagement";
import {
  AutocorrectionStatus,
  TaskAutocorrection,
  TaskDetails,
  TaskGrade,
  TaskSubmission,
  TeacherActivity,
} from "@/types/activity";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  Text,
  useTheme,
} from "react-native-paper";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { File } from "@/types/file";
import { getUser } from "@/services/userManagement";
import { User } from "@/types/user";
import UserCard from "@/components/cards/UserCard";
import { formatDateTime } from "@/utils/date";
import { TextField } from "@/components/forms/TextField";
import { AlertText } from "@/components/AlertText";
import { useTaskGrade } from "@/hooks/useTaskGrade";
import { ToggleableNumberInput } from "@/components/forms/ToggleableNumberInput";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { FullScreenModal } from "@/components/FullScreenModal";
import { validateFilesForAutocorrection } from "@/utils/fileValidation";

export default function TaskSubmissionPage() {
  const router = useRouter();
  const theme = useTheme();
  const {
    courseId: courseIdParam,
    taskId: taskIdParam,
    studentId: studentIdParam,
  } = useLocalSearchParams();

  const courseId = courseIdParam as string;
  const taskId = taskIdParam as string;
  const studentId = studentIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherTask, setTeacherTask] = useState<TeacherActivity | null>(null);
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const [submittedFiles, setSubmittedFiles] = useState<File[]>([]);

  const [studentSubmission, setStudentSubmission] =
    useState<TaskSubmission | null>(null);

  const [student, setStudent] = useState<User | null>(null);

  const [hasPreviousGrade, setHasPreviousGrade] = useState(false);

  const temporalTaskGradeHook = useTaskGrade();
  const { taskGrade: temporalTaskGrade } = temporalTaskGradeHook;

  const [taskAutocorrection, setTaskAutocorrection] =
    useState<TaskAutocorrection | null>(null);
  const [autocorrectionStatus, setAutocorrectionStatus] =
    useState<AutocorrectionStatus>(AutocorrectionStatus.NOT_STARTED);
  const [autocorrectionModalVisible, setAutocorrectionModalVisible] =
    useState(false);
  const [autocorrected, setAutocorrected] = useState(false);
  const [isAutocorrecting, setIsAutocorrecting] = useState(false);

  // Estado para el modal de error de validación de archivos
  const [fileValidationErrorModalVisible, setFileValidationErrorModalVisible] =
    useState(false);
  const [fileValidationErrorMessage, setFileValidationErrorMessage] =
    useState("");

  async function fetchTeacherTask() {
    if (!courseId || !taskId) return;
    setIsLoading(true);

    try {
      const teacherTask = await getTeacherTask(courseId, Number(taskId));
      setTeacherTask(teacherTask);
      setTaskDetails(teacherTask.activity.activityDetails as TaskDetails);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchStudentSubmission = async () => {
    if (!studentId || !courseId || !taskId) return;
    setIsLoading(true);

    try {
      const response = await getTaskSubmission(
        courseId,
        Number(taskId),
        Number(studentId)
      );

      setStudentSubmission(response);
      setSubmittedFiles(response.responseFile ? [response.responseFile] : []);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchStudent() {
    if (!studentId) return;
    setIsLoading(true);

    try {
      const studentData = await getUser(Number(studentId));
      setStudent(studentData);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTaskGrade() {
    if (!courseId || !taskId || !studentId) return;
    setIsLoading(true);
    try {
      const grade = await getTaskGrade(
        courseId,
        Number(taskId),
        Number(studentId)
      );
      if (grade) {
        temporalTaskGradeHook.setTaskGrade(grade);
        setHasPreviousGrade(true);
      } else {
        temporalTaskGradeHook.setTaskGrade(
          new TaskGrade(Number(taskId), Number(studentId), 0, "")
        );
        setHasPreviousGrade(false);
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleStudentPress = () => {
    router.push({
      pathname: `/users/[userId]`,
      params: {
        userId: studentId,
      },
    });
  };

  const handleSaveGrade = async () => {
    if (!courseId || !taskId || !studentId) return;
    setIsLoading(true);
    try {
      await gradeTask(courseId, temporalTaskGrade);
      setHasPreviousGrade(true);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressAutocorrectButton = async () => {
    // Validar archivos antes de proceder con la autocorrección
    const validation = validateFilesForAutocorrection(
      taskDetails?.instructionsFile,
      studentSubmission?.responseFile
    );

    if (!validation.isValid) {
      setFileValidationErrorMessage(
        validation.errorMessage || "Error de validación de archivos"
      );
      setFileValidationErrorModalVisible(true);
      return;
    }

    setIsAutocorrecting(true);
    await handleGetAutocorrection();
    setIsAutocorrecting(false);
    setAutocorrectionModalVisible(true);
  };

  const handleAutocorrect = async () => {
    if (!courseId || !taskId || !studentId) return;
    // setIsLoading(true);
    setAutocorrectionModalVisible(false);
    try {
      await autocorrectTask(courseId, Number(taskId), Number(studentId));
      setAutocorrectionStatus(AutocorrectionStatus.IN_PROGRESS);
      setTaskAutocorrection({
        correctionId: null,
        status: AutocorrectionStatus.IN_PROGRESS,
        mark: null,
        feedback_message: null,
        createdAt: null,
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
      setAutocorrectionStatus(AutocorrectionStatus.FAILED);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleGetAutocorrection = async () => {
    if (!courseId || !taskId || !studentId) return;
    // setIsLoading(true);
    try {
      const fetchedAutocorrection = await getTaskAutocorrection(
        courseId,
        Number(taskId),
        Number(studentId)
      );
      setTaskAutocorrection(fetchedAutocorrection);
      setAutocorrectionStatus(fetchedAutocorrection.status);
      return fetchedAutocorrection;
    } catch (error) {
      setErrorMessage((error as Error).message);
      setAutocorrectionStatus(AutocorrectionStatus.FAILED);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleApplyAutocorrection = () => {
    if (!taskAutocorrection) return;
    setAutocorrected(true);

    let taskGrade = { ...temporalTaskGrade } as TaskGrade;
    taskGrade.mark = taskAutocorrection.mark;
    taskGrade.feedback_message = taskAutocorrection.feedback_message;
    temporalTaskGradeHook.setTaskGrade(taskGrade);
    setAutocorrectionStatus(AutocorrectionStatus.COMPLETED);
    setAutocorrectionModalVisible(false);
  };

  useEffect(() => {
    fetchStudentSubmission();
  }, [teacherTask]);

  useFocusEffect(
    useCallback(() => {
      fetchTeacherTask();
      fetchStudent();
      fetchTaskGrade();
      setStudentSubmission(null);
      temporalTaskGradeHook.setTaskGrade(null);
      setHasPreviousGrade(false);
    }, [courseId, taskId, studentId])
  );

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (autocorrectionStatus === AutocorrectionStatus.IN_PROGRESS) {
      pollingInterval = setInterval(async () => {
        const fetchedAutocorrection = await handleGetAutocorrection();

        if (fetchedAutocorrection.status !== AutocorrectionStatus.IN_PROGRESS) {
          clearInterval(pollingInterval!);
          setAutocorrectionModalVisible(true);
        }
      }, 2000); // Polling every 2 seconds
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [autocorrectionStatus]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            router.back();
          }}
        />
        <Appbar.Content title="Información de la entrega" />
        {isEditing && (
          <Appbar.Action
            icon={
              isAutocorrecting
                ? () => (
                    <ActivityIndicator
                      animating={true}
                      size={24}
                      color={theme.colors.primary}
                    />
                  )
                : "robot"
            }
            onPress={async () => {
              if (!isAutocorrecting) {
                await handlePressAutocorrectButton();
              }
            }}
            disabled={
              isAutocorrecting ||
              isLoading ||
              !teacherTask ||
              !studentSubmission ||
              !student ||
              !taskDetails ||
              !temporalTaskGrade
            }
          />
        )}
      </Appbar.Header>
      {isLoading ||
      !teacherTask ||
      !studentSubmission ||
      !student ||
      !taskDetails ||
      !temporalTaskGrade ? (
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={16} // Ajusta este valor según la altura de tu Appbar/Header
        >
          <ScrollView
            contentContainerStyle={{
              backgroundColor: theme.colors.background,
              padding: 16,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                flex: 1,
                gap: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <UserCard user={student} onPress={handleStudentPress} />
              </View>

              <TextField label="Título" value={taskDetails.title} />

              <TextField
                label="Fecha límite"
                value={formatDateTime(taskDetails.dueDate)}
              />

              {studentSubmission && studentSubmission.submited ? (
                <>
                  <TextField
                    label="Fecha de entrega"
                    value={formatDateTime(studentSubmission.submissionDate)}
                  />

                  <Text>Archivos de la entrega</Text>

                  <ToggleableFileInput
                    files={submittedFiles}
                    editable={false}
                    onChange={() => {}}
                    maxFiles={1}
                  />
                  <Divider />
                  <Text>Calificación de la entrega</Text>
                  {!hasPreviousGrade && !isEditing && (
                    <AlertText text="La entrega no ha sido calificada todavía." />
                  )}

                  {autocorrected && isEditing && (
                    <AlertText text="Corrección realizada por IA." />
                  )}

                  {(hasPreviousGrade || isEditing) && (
                    <View style={{ flex: 1, gap: 16 }}>
                      <ToggleableNumberInput
                        label="Nota"
                        value={temporalTaskGrade.mark}
                        editable={isEditing}
                        onChange={(mark) => {
                          temporalTaskGradeHook.setMark(mark);
                          setAutocorrected(false);
                        }}
                        minValue={0}
                        maxValue={10}
                      />
                      <ToggleableTextInput
                        label="Comentario de retroalimentación"
                        placeholder="Escriba un comentario para el estudiante"
                        value={temporalTaskGrade.feedback_message}
                        editable={isEditing}
                        onChange={(feedback) => {
                          temporalTaskGradeHook.setFeedbackMessage(feedback);
                          setAutocorrected(false);
                        }}
                      />
                    </View>
                  )}
                </>
              ) : (
                <Text variant="titleSmall">El alumno no entregó la tarea</Text>
              )}
            </View>
          </ScrollView>
          <View style={{ padding: 16 }}>
            {studentSubmission &&
              studentSubmission.submited &&
              (isEditing ? (
                <Button
                  icon="note-check"
                  mode="contained"
                  onPress={() => handleSaveGrade()}
                  disabled={isLoading}
                >
                  Confirmar calificación
                </Button>
              ) : (
                <Button
                  icon="note-check"
                  mode="contained"
                  onPress={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  {hasPreviousGrade
                    ? "Editar calificación"
                    : "Calificar entrega"}
                </Button>
              ))}
          </View>
        </KeyboardAvoidingView>
      )}
      <FullScreenModal
        visible={autocorrectionModalVisible}
        onDismiss={() => setAutocorrectionModalVisible(false)}
      >
        <View style={{ gap: 16 }}>
          <Text variant="titleLarge">Estado de la autocorrección</Text>
          {autocorrectionStatus === AutocorrectionStatus.NOT_STARTED && (
            <View style={{ gap: 16 }}>
              <Text>
                ¿Desea corregir la tarea automáticamente con Inteligencia
                Artificial?
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <Button
                  mode="text"
                  onPress={() => setAutocorrectionModalVisible(false)}
                >
                  Cancelar
                </Button>
                <Button mode="text" onPress={() => handleAutocorrect()}>
                  Aceptar
                </Button>
              </View>
            </View>
          )}
          {autocorrectionStatus === AutocorrectionStatus.IN_PROGRESS && (
            <View style={{ alignItems: "center", gap: 16 }}>
              <Text>
                La corrección se está realizando de forma automática. Puede
                salir de esta pantalla mientras tanto.
              </Text>
              <ActivityIndicator animating={true} size="large" />
              <Button
                mode="text"
                onPress={() => setAutocorrectionModalVisible(false)}
              >
                Aceptar
              </Button>
            </View>
          )}
          {autocorrectionStatus === AutocorrectionStatus.COMPLETED && (
            <View style={{ gap: 16 }}>
              <Text>
                La tarea se ha corregido exitosamente. Pulse el botón 'Aceptar'
                para obtener el resultado de la corrección. NOTA: esto pisará la
                corrección manual si la hubiera.
              </Text>
              <Button
                mode="text"
                onPress={async () => {
                  // Reiniciar el proceso de autocorrección
                  setAutocorrectionStatus(AutocorrectionStatus.NOT_STARTED);
                  setTaskAutocorrection(null);
                  await handleAutocorrect();
                }}
              >
                Corregir de nuevo
              </Button>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  gap: 8,
                }}
              >
                <Button
                  mode="text"
                  onPress={() => {
                    // Acción para descartar corrección
                    setAutocorrectionModalVisible(false);
                  }}
                >
                  Descartar
                </Button>
                <Button
                  mode="text"
                  onPress={() => {
                    // Acción para aceptar corrección
                    handleApplyAutocorrection();
                  }}
                >
                  Aceptar
                </Button>
              </View>
            </View>
          )}
          {autocorrectionStatus === AutocorrectionStatus.FAILED && (
            <View style={{ alignItems: "center", gap: 16 }}>
              <Text>
                Hubo un error al corregir automáticamente la tarea. Intente
                nuevamente.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <Button
                  mode="text"
                  onPress={async () => {
                    // Reiniciar el proceso de autocorrección
                    setAutocorrectionStatus(AutocorrectionStatus.NOT_STARTED);
                    setTaskAutocorrection(null);
                    await handleAutocorrect();
                  }}
                >
                  Intentar de nuevo
                </Button>
                <Button
                  mode="text"
                  onPress={() => setAutocorrectionModalVisible(false)}
                >
                  Aceptar
                </Button>
              </View>
            </View>
          )}
        </View>
      </FullScreenModal>
      <FullScreenModal
        visible={fileValidationErrorModalVisible}
        onDismiss={() => setFileValidationErrorModalVisible(false)}
      >
        <View style={{ gap: 16 }}>
          <Text variant="titleLarge">Error de Validación de Archivos</Text>
          <Text>{fileValidationErrorMessage}</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button
              mode="text"
              onPress={() => setFileValidationErrorModalVisible(false)}
            >
              Aceptar
            </Button>
          </View>
        </View>
      </FullScreenModal>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
