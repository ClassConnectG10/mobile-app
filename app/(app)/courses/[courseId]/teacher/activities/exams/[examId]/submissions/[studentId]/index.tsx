import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/forms/TextField";
import UserCard from "@/components/cards/UserCard";
import {
  getExamGrade,
  getExamSubmission,
  getTeacherExam,
} from "@/services/activityManagement";
import { getUser } from "@/services/userManagement";
import {
  ExamDetails,
  ExamGrade,
  ExamSubmission,
  TeacherActivity,
} from "@/types/activity";
import { User } from "@/types/user";
import { formatDateTime } from "@/utils/date";
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
import { AlertText } from "@/components/AlertText";

export default function TeacherSubmissionPage() {
  const theme = useTheme();
  const router = useRouter();
  const {
    courseId: courseIdParam,
    examId: examIdParam,
    studentId: studentIdParam,
  } = useLocalSearchParams();

  const courseId = courseIdParam as string;
  const examId = examIdParam as string;
  const studentId = studentIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teacherExam, setTeacherExam] = useState<TeacherActivity | null>(null);
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [studentSubmission, setStudentSubmission] =
    useState<ExamSubmission | null>(null);
  const [student, setStudent] = useState<User | null>(null);

  const [examGrade, setExamGrade] = useState<ExamGrade | null>(null);

  async function fetchTeacherExam() {
    if (!courseId || !examId || !studentId) return;

    setIsLoading(true);
    try {
      const activity = await getTeacherExam(courseId, Number(examId));
      setTeacherExam(activity);
      setExamDetails(activity.activity.activityDetails as ExamDetails);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSubmission() {
    if (!teacherExam) return;
    setIsLoading(true);

    try {
      const submissionData = await getExamSubmission(
        courseId,
        Number(examId),
        Number(studentId),
        (teacherExam.activity.activityDetails as ExamDetails).examItems,
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

  async function fetchExamGrade() {
    if (!courseId || !examId || !studentId) return;
    setIsLoading(true);

    try {
      const grade = await getExamGrade(
        courseId,
        Number(examId),
        Number(studentId),
      );
      setExamGrade(grade);
      if (grade) {
        setExamGrade(grade);
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

  const handleEditGrade = () => {
    if (!teacherExam || !studentSubmission) return;

    router.push({
      pathname: `/courses/[courseId]/teacher/activities/exams/[examId]/submissions/[studentId]/grade`,
      params: {
        courseId,
        examId,
        studentId,
      },
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubmission();
    }, [teacherExam]),
  );

  useFocusEffect(
    useCallback(() => {
      fetchTeacherExam();
      fetchStudent();
      fetchExamGrade();
    }, [courseId, examId, studentId]),
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Entrega del examen"} />
      </Appbar.Header>
      {isLoading || !teacherExam || !studentSubmission || !student ? (
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
        <>
          <ScrollView
            contentContainerStyle={{
              backgroundColor: theme.colors.background,
              justifyContent: "space-between",
              padding: 16,
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

            <TextField label="Título" value={examDetails.title} />

            <TextField
              label="Fecha límite"
              value={formatDateTime(examDetails.dueDate)}
            />

            {studentSubmission && studentSubmission.submited ? (
              <>
                <TextField
                  label="Fecha de entrega"
                  value={formatDateTime(studentSubmission.submissionDate)}
                />
                <Divider />
                <Text>Calificación de la entrega</Text>
                {!examGrade ? (
                  <AlertText text="La entrega no ha sido calificada todavía." />
                ) : (
                  <View style={{ flex: 1, gap: 16 }}>
                    <TextField label="Nota" value={examGrade.mark.toString()} />
                    <TextField
                      label="Comentario de retroalimentación"
                      value={examGrade.feedback_message}
                    />
                  </View>
                )}
              </>
            ) : (
              <Text variant="titleSmall">El alumno no entregó el examen</Text>
            )}
          </ScrollView>
          {studentSubmission && studentSubmission.submited && (
            <View style={{ padding: 16 }}>
              <Button
                icon="note-check"
                mode="contained"
                onPress={() => handleEditGrade()}
                disabled={isLoading}
              >
                {examGrade ? "Editar calificación" : "Calificar entrega"}
              </Button>
            </View>
          )}
        </>
      )}
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
