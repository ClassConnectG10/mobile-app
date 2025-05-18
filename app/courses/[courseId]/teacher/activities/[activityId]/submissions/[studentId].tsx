import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/forms/TextField";
import UserCard from "@/components/cards/UserCard";
import {
  getActivitySubmission,
  getTeacherActivity,
} from "@/services/activityManagement";
import { getUser } from "@/services/userManagement";
import {
  ActivitySubmission,
  ActivityType,
  TeacherActivity,
} from "@/types/activity";
import { User } from "@/types/user";
import { formatDateTime } from "@/utils/date";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Appbar, Text, useTheme } from "react-native-paper";

export default function TeacherSubmissionPage() {
  const theme = useTheme();
  const router = useRouter();
  const {
    courseId: courseIdParam,
    activityId: activityIdParam,
    studentId: studentIdParam,
  } = useLocalSearchParams();

  const courseId = courseIdParam as string;
  const activityId = activityIdParam as string;
  const studentId = studentIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherActivity, setTeacherActivity] =
    useState<TeacherActivity | null>(null);
  const [studentSubmission, setStudentSubmission] =
    useState<ActivitySubmission | null>(null);
  const [student, setStudent] = useState<User | null>(null);

  async function fetchTeacherActivity() {
    if (!courseId || !activityId) return;

    setIsLoading(true);
    try {
      const activity = await getTeacherActivity(courseId, Number(activityId));
      setTeacherActivity(activity);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSubmission() {
    if (!courseId || !activityId || !studentId || !teacherActivity) return;

    setIsLoading(true);
    try {
      const submissionData = await getActivitySubmission(
        courseId,
        teacherActivity.activity,
        Number(studentId),
      );

      setStudentSubmission(submissionData);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

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

  useEffect(() => {
    fetchSubmission();
  }, [teacherActivity]);

  useEffect(() => {
    fetchTeacherActivity();
    fetchStudent();
  }, [courseId, activityId, studentId]);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content
            title={
              teacherActivity?.activity.type === ActivityType.TASK
                ? "Entrega de la tarea"
                : "Entrega del examen"
            }
          />
        </Appbar.Header>
        {isLoading || !teacherActivity || !studentSubmission || !student ? (
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
          <View style={{ padding: 16, gap: 16 }}>
            <UserCard user={student} onPress={handleStudentPress} />

            <TextField
              label="Título"
              value={teacherActivity.activity.activityDetails.title}
            />
            {studentSubmission && studentSubmission.submited ? (
              <>
                <TextField
                  label="Respuesta del estudiante"
                  value={studentSubmission.response}
                />
                <TextField
                  label="Fecha de entrega"
                  value={formatDateTime(studentSubmission.submissionDate)}
                />
              </>
            ) : (
              <Text variant="titleSmall">
                El alumno no entregó
                {teacherActivity.activity.type === ActivityType.TASK
                  ? " la tarea"
                  : " el examen"}
              </Text>
            )}
          </View>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
