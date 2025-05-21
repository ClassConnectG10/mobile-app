import { AlertText } from "@/components/AlertText";
import { DatePickerButton } from "@/components/forms/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import {
  deleteExam,
  deleteTask,
  getStudentTask,
  getTaskSubmission,
  getTeacherExam,
  getTeacherTask,
  publishExam,
  publishTask,
  submitTask,
  updateExam,
  updateTask,
  uploadTaskFile,
} from "@/services/activityManagement";
import { getCourse } from "@/services/courseManagement";
import {
  ExamDetails,
  StudentActivity,
  TaskDetails,
  TaskSubmission,
  TeacherActivity,
} from "@/types/activity";
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
  Divider,
} from "react-native-paper";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { File } from "@/types/file";
import { useUserContext } from "@/utils/storage/userContext";
import { set } from "zod";

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
  const [taskFiles, setTaskFiles] = useState<File[]>([]);
  const [taskFilesChanged, setTaskFilesChanged] = useState(false);

  const [submitttedFiles, setSubmitttedFiles] = useState<File[]>([]);
  const [submittedFilesChanged, setSubmittedFilesChanged] = useState(false);

  const [studentSubmission, setStudentSubmission] =
    useState<TaskSubmission | null>(null);

  const [course, setCourse] = useState<Course | null>(null);

  const taskDetailsHook = useTaskDetails();
  const taskDetails = taskDetailsHook.taskDetails;

  const userContext = useUserContext();

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

  async function fetchStudentTask() {
    try {
      setIsLoading(true);
      if (courseId && taskId) {
        const studentTask = await getStudentTask(courseId, Number(taskId));
        setStudentTask(studentTask);
        taskDetailsHook.setTaskDetails(
          studentTask.activity.activityDetails as TaskDetails
        );
        setTaskFiles(
          (studentTask.activity.activityDetails as TaskDetails).instructionsFile
            ? [
                (studentTask.activity.activityDetails as TaskDetails)
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

  const fetchStudentSubmission = async () => {
    if (!studentTask || !userContext.user) return;

    try {
      setIsLoading(true);
      const response = await getTaskSubmission(
        courseId,
        Number(taskId),
        userContext.user.id
      );

      setStudentSubmission(response);
      setSubmitttedFiles(response.responseFile ? [response.responseFile] : []);
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
        submitttedFiles.length > 0 ? submitttedFiles[0] : null
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

  const handleSubmittedFilesChange = (files: File[]) => {
    setSubmitttedFiles(files);
    setSubmittedFilesChanged(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudentTask();
      fetchCourse();
    }, [courseId, taskId])
  );

  useFocusEffect(
    useCallback(() => {
      if (studentTask) {
        fetchStudentSubmission();
      }
    }, [studentTask])
  );

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
              editable={false}
              onChange={taskDetailsHook.setTitle}
            />
            <ToggleableTextInput
              label="Instrucciones"
              placeholder="Instrucciones del examen"
              value={taskDetails.instructions}
              onChange={taskDetailsHook.setInstructions}
              editable={false}
            />
            <DatePickerButton
              label="Fecha límite"
              type="datetime"
              value={taskDetails.dueDate}
              editable={false}
              onChange={taskDetailsHook.setDueDate}
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
              files={submitttedFiles}
              editable={studentTask ? !studentTask.submited : false}
              onChange={handleSubmittedFilesChange}
              maxFiles={1}
            />
          </View>

          <View
            style={{
              gap: 16,
            }}
          >
            {studentTask && !studentTask.submited && (
              <Button
                mode="contained"
                onPress={handleSubmitResponse}
                disabled={isLoading || studentTask.submited}
              >
                Enviar respuesta
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
