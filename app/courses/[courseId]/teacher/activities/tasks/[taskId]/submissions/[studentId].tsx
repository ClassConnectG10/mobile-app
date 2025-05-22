import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  getTaskSubmission,
  getTeacherTask,
} from "@/services/activityManagement";
import { getCourse } from "@/services/courseManagement";
import { TaskDetails, TaskSubmission, TeacherActivity } from "@/types/activity";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Text,
  useTheme,
  Divider,
} from "react-native-paper";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { File } from "@/types/file";
import { getUser } from "@/services/userManagement";
import { User } from "@/types/user";
import UserCard from "@/components/cards/UserCard";
import { formatDateTime } from "@/utils/date";
import { TextField } from "@/components/forms/TextField";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherTask, setTeacherTask] = useState<TeacherActivity | null>(null);
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const [submittedFiles, setSubmittedFiles] = useState<File[]>([]);

  const [studentSubmission, setStudentSubmission] =
    useState<TaskSubmission | null>(null);

  const [student, setStudent] = useState<User | null>(null);

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

  const handleStudentPress = () => {
    router.push({
      pathname: `/users/[userId]`,
      params: {
        userId: studentId,
      },
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeacherTask();
      fetchStudent();
      fetchStudentSubmission();
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
