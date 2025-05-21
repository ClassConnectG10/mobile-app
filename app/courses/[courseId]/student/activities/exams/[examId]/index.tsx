import {
  getStudentExam,
  getStudentExamSubmission,
} from "@/services/activityManagement";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Appbar, Button, Dialog, useTheme, Text } from "react-native-paper";
import { ExamDetails, ExamSubmission, StudentActivity } from "@/types/activity";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/forms/TextField";
import { formatDateTime } from "@/utils/date";
import { useUserContext } from "@/utils/storage/userContext";
import ExamSubmissionCard from "@/components/cards/ExamSubmissionCard";
import { set } from "zod";

export default function StudentExamPage() {
  const router = useRouter();
  const theme = useTheme();

  const { courseId: courseIdParam, examId: examIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const examId = Number(examIdParam);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showConfirmationStartExam, setShowConfirmationStartExam] =
    useState(false);

  const [studentExam, setStudentExam] = useState<StudentActivity>(null);
  const [examDetails, setExamDetails] = useState<ExamDetails>(null);
  const [examSubmission, setExamSubmission] = useState<ExamSubmission>(null);

  const userContextHook = useUserContext();
  const userContext = userContextHook.user;
  const studentId = userContext.id;

  const fetchStudentExam = async () => {
    if (!courseId || !examId) return;
    setIsLoading(true);

    try {
      const exam = await getStudentExam(courseId, examId);
      setStudentExam(exam);
      setExamDetails(exam.activity.activityDetails as ExamDetails);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentExamSubmission = async () => {
    if (!examDetails) return;
    setIsLoading(true);

    try {
      const examSubmission = await getStudentExamSubmission(
        courseId,
        examId,
        studentId,
        examDetails.examItems
      );
      setExamSubmission(examSubmission);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuestions = async () => {
    setShowConfirmationStartExam(false);
    router.push({
      pathname:
        "/courses/[courseId]/student/activities/exams/[examId]/questions",
      params: {
        courseId,
        examId,
      },
    });
  };

  useEffect(() => {
    fetchStudentExamSubmission();
  }, [examDetails]);

  useFocusEffect(
    useCallback(() => {
      fetchStudentExam();
    }, [courseId, examId])
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={"Información del examen"} />
        </Appbar.Header>
        {isLoading || !examDetails || !examSubmission || !userContext ? (
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
            <View style={{ gap: 16 }}>
              <ExamSubmissionCard
                student={userContext}
                examSubmission={examSubmission}
              />

              <TextField label="Nombre" value={examDetails.title} />
              <TextField
                label="Instrucciones"
                value={examDetails.instructions}
              />
              <TextField
                label="Fecha límite"
                value={formatDateTime(examDetails.dueDate)}
              />
              {examSubmission.submited && (
                <TextField
                  label="Fecha de entrega"
                  value={formatDateTime(examSubmission.submissionDate)}
                />
              )}
            </View>
            <View>
              {examSubmission.submited ? (
                <Button
                  mode="contained"
                  onPress={handleViewQuestions}
                  disabled={isLoading}
                  icon="eye"
                >
                  Ver entrega
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowConfirmationStartExam(true);
                  }}
                  disabled={isLoading}
                  icon="pen"
                >
                  Comenzar examen
                </Button>
              )}
            </View>
          </ScrollView>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
      <Dialog
        visible={showConfirmationStartExam}
        onDismiss={() => setShowConfirmationStartExam(false)}
      >
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Está a punto de comenzar el examen. Una vez iniciado, no podrá
            volver haca atrás y volver a abrirlo. ¿Está seguro de que desea
            continuar?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationStartExam(false)}>
            Cancelar
          </Button>
          <Button onPress={handleViewQuestions}>Empezar</Button>
        </Dialog.Actions>
      </Dialog>
    </>
  );
}
