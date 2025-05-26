import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  getTaskGrade,
  getTaskSubmission,
  getTeacherTask,
  gradeTask,
} from "@/services/activityManagement";
import {
  TaskDetails,
  TaskGrade,
  TaskSubmission,
  TeacherActivity,
} from "@/types/activity";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
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
import { set } from "zod";
import { useTaskGrade } from "@/hooks/useTaskGrade";
import { ToggleableNumberInput } from "@/components/forms/ToggleableNumberInput";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";

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
  const [taskGrade, setTaskGrade] = useState<TaskGrade | null>(null);

  const temporalTaskGradeHook = useTaskGrade();
  const { taskGrade: temporalTaskGrade } = temporalTaskGradeHook;

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
      setTaskGrade(grade);
      if (grade) {
        temporalTaskGradeHook.setTaskGrade(grade);
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
      setTaskGrade(temporalTaskGrade);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeacherTask();
      fetchStudent();
      fetchStudentSubmission();
      fetchTaskGrade();
    }, [courseId, taskId, studentId])
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            router.back();
          }}
        />
        <Appbar.Content title="Información de la entrega" />
      </Appbar.Header>
      {isLoading ||
      !teacherTask ||
      !studentSubmission ||
      !student ||
      !taskDetails ? (
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
          }}
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
              </>
            ) : (
              <Text variant="titleSmall">El alumno no entregó el examen</Text>
            )}
            <Divider />
            <Text>Calificación de la entrega</Text>
            {!taskGrade && !isEditing && (
              <AlertText text="La entrega no ha sido calificada todavía." />
            )}

            {(taskGrade || isEditing) && (
              <View style={{ flex: 1, gap: 16 }}>
                <ToggleableNumberInput
                  label="Nota"
                  value={temporalTaskGrade.mark}
                  editable={isEditing}
                  onChange={(mark) => temporalTaskGradeHook.setMark(mark)}
                  minValue={0}
                  maxValue={10}
                />
                <ToggleableTextInput
                  label="Comentario de retroalimentación"
                  placeholder="Escriba un comentario para el estudiante"
                  value={temporalTaskGrade.feedback_message}
                  editable={isEditing}
                  onChange={(feedback) =>
                    temporalTaskGradeHook.setFeedbackMessage(feedback)
                  }
                />
              </View>
            )}

            {isEditing ? (
              <>
                <Button
                  icon="note-check"
                  mode="contained"
                  onPress={() => handleSaveGrade()}
                  disabled={isLoading}
                >
                  Confirmar calificación
                </Button>
              </>
            ) : (
              <Button
                icon="note-check"
                mode="contained"
                onPress={() => setIsEditing(true)}
                disabled={isLoading}
              >
                {taskGrade ? "Editar calificación" : "Calificar entrega"}
              </Button>
            )}
          </View>
        </ScrollView>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
