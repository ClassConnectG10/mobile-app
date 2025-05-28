import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  getStudentTask,
  getTaskGrade,
  getTaskSubmission,
  submitTask,
} from "@/services/activityManagement";
import {
  StudentActivity,
  TaskDetails,
  TaskGrade,
  TaskSubmission,
} from "@/types/activity";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Text,
  useTheme,
  Button,
  Divider,
} from "react-native-paper";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { File } from "@/types/file";
import { useUserContext } from "@/utils/storage/userContext";
import { TextField } from "@/components/forms/TextField";
import { formatDateTime } from "@/utils/date";

export default function StudentExamPage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, taskId: taskIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const taskId = taskIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [studentTask, setStudentTask] = useState<StudentActivity | null>(null);
  const [taskDetails, setTaskDetails] = useState<TaskDetails>(null);

  const [taskFiles, setTaskFiles] = useState<File[]>([]);
  const [submittedFiles, setSubmittedFiles] = useState<File[]>([]);

  const [studentSubmission, setStudentSubmission] =
    useState<TaskSubmission | null>(null);

  const [taskGrade, setTaskGrade] = useState<TaskGrade | null>(null);

  const userContext = useUserContext();

  async function fetchStudentTask() {
    if (!courseId || !taskId) return;
    setIsLoading(true);

    try {
      const studentTask = await getStudentTask(courseId, Number(taskId));
      setStudentTask(studentTask);
      setTaskDetails(studentTask.activity.activityDetails as TaskDetails);
      setTaskFiles(
        (studentTask.activity.activityDetails as TaskDetails).instructionsFile
          ? [
              (studentTask.activity.activityDetails as TaskDetails)
                .instructionsFile,
            ]
          : []
      );
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchStudentSubmission = async () => {
    if (!studentTask || !userContext.user) return;
    setIsLoading(true);

    try {
      const response = await getTaskSubmission(
        courseId,
        Number(taskId),
        userContext.user.id
      );

      setStudentSubmission(response);
      setSubmittedFiles(response.responseFile ? [response.responseFile] : []);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!studentTask || !userContext.user) return;

    try {
      setIsLoading(true);
      await submitTask(
        courseId,
        Number(taskId),
        submittedFiles.length > 0 ? submittedFiles[0] : null
      );
      const submission = await getTaskSubmission(
        courseId,
        Number(taskId),
        userContext.user.id
      );

      setStudentSubmission(submission);
      setStudentTask((prev) => ({
        ...prev,
        submited: true,
        submitedDate: submission.submissionDate,
      }));
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchTaskGrade() {
    if (!courseId || !taskId || !userContext.user) return;
    setIsLoading(true);

    try {
      const grade = await getTaskGrade(
        courseId,
        Number(taskId),
        userContext.user?.id
      );
      setTaskGrade(grade);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchStudentTask();
    }, [courseId, taskId])
  );

  useEffect(() => {
    fetchStudentSubmission();
    fetchTaskGrade();
  }, [studentTask]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            router.back();
          }}
        />
        <Appbar.Content title={"Información de la tarea"} />
      </Appbar.Header>
      {isLoading || !studentTask || !taskDetails || !studentSubmission ? (
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
            backgroundColor: theme.colors.background,
            justifyContent: "space-between",
            padding: 16,
            gap: 16,
          }}
        >
          {/* <ActivityCard 
  TODO: Agregar SUBMISSION CARD O ALGO POR EL ESTILO
            /> */}

          <TextField label="Nombre" value={taskDetails.title} />

          <TextField label="Instrucciones" value={taskDetails.instructions} />

          <TextField
            label="Fecha límite"
            value={formatDateTime(taskDetails.dueDate)}
          />

          <Text>Archivos de la consigna</Text>

          <ToggleableFileInput
            files={taskFiles}
            editable={false}
            onChange={setTaskFiles}
            maxFiles={1}
          />

          <Divider />

          <Text>Archivos de la entrega</Text>

          <ToggleableFileInput
            files={submittedFiles}
            editable={studentTask ? !studentTask.submited : false}
            onChange={setSubmittedFiles}
            maxFiles={1}
          />

          {studentTask && !studentTask.submited && (
            <Button
              mode="contained"
              onPress={handleSubmitResponse}
              disabled={
                isLoading ||
                studentTask.submited ||
                !submittedFiles ||
                submittedFiles.length === 0
              }
            >
              Enviar respuesta
            </Button>
          )}

          {taskGrade && (
            <View style={{ flex: 1, gap: 16 }}>
              <Divider />
              <Text>Calificación de la entrega</Text>
              <TextField label="Nota" value={taskGrade.mark} />
              <TextField
                label="Comentario de retroalimentación"
                value={taskGrade.feedback_message}
              />
            </View>
          )}
        </ScrollView>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
