import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ExamDetails, ExamGrade, ExamItemAnswer } from "@/types/activity";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import {
  Appbar,
  Button,
  ActivityIndicator,
  useTheme,
  Text,
  Icon,
} from "react-native-paper";
import { ExamItemCard } from "@/components/cards/examCards/ExamItemCard";
import { useFocusEffect } from "@react-navigation/native";
import {
  getExamGrade,
  getExamSubmission,
  getStudentExam,
  submitExam,
} from "@/services/activityManagement";
import { ExamItemMode } from "@/components/cards/examCards/examItemMode";
import { useUserContext } from "@/utils/storage/userContext";
import { FullScreenModal } from "@/components/FullScreenModal";
import { customColors } from "@/utils/constants/colors";

export default function StudentFillExam() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, examId: examIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const examId = Number(examIdParam);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [, setStudentExam] = useState(null);
  const [examDetails, setExamDetails] = useState(null);
  const [examSubmission, setExamSubmission] = useState(null);
  const [examGrade, setExamGrade] = useState<ExamGrade>(null);

  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const userContextHook = useUserContext();
  const studentId = userContextHook.user.id;

  const fetchStudentExam = async () => {
    if (!courseId || !examId) return;
    setIsLoading(true);

    try {
      const exam = await getStudentExam(courseId, examId);
      const details = exam.activity.activityDetails as ExamDetails;
      setStudentExam(exam);
      setExamDetails(details);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentExamSubmission = async () => {
    if (!examDetails) return;

    try {
      const examSubmission = await getExamSubmission(
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

  const setStudentAnswer = (index: number, answer: ExamItemAnswer) => {
    const newSubmittedExamItems = [...examSubmission.submittedExamItems];
    newSubmittedExamItems[index] = {
      ...newSubmittedExamItems[index],
      answer,
    };
    const newExamSubmission = {
      ...examSubmission,
      submittedExamItems: newSubmittedExamItems,
    };
    setExamSubmission(newExamSubmission);
  };

  const setCorrectAnswer = (index: number, correct: boolean) => {
    const newSubmittedExamItems = [...examSubmission.submittedExamItems];
    newSubmittedExamItems[index] = {
      ...newSubmittedExamItems[index],
      correct,
    };
    const newExamSubmission = {
      ...examSubmission,
      submittedExamItems: newSubmittedExamItems,
    };
    setExamSubmission(newExamSubmission);
  };

  async function fetchExamGrade() {
    if (!courseId || !examId || !studentId) return;
    setIsLoading(true);

    try {
      const grade = await getExamGrade(
        courseId,
        Number(examId),
        Number(studentId)
      );
      setExamGrade(grade);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFinishExam = async () => {
    setIsLoading(true);
    try {
      await submitExam(courseId, examId, examSubmission.submittedExamItems);
      router.back();
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentExamSubmission();
  }, [examDetails]);

  useFocusEffect(
    useCallback(() => {
      fetchStudentExam();
      fetchExamGrade();
    }, [courseId, examId])
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            router.back();
          }}
        />
        <Appbar.Content
          title={
            examSubmission?.submited ? "Entrega realizada" : "Completar examen"
          }
        />
        {examSubmission?.submited && examGrade && (
          <Appbar.Action
            icon="help"
            onPress={() => setHelpModalVisible(true)}
            disabled={isLoading}
          />
        )}
      </Appbar.Header>
      {isLoading || !examDetails || !examSubmission ? (
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
        <View
          style={{
            padding: 16,
            flex: 1,
          }}
        >
          <FlatList
            data={examDetails.examItems}
            keyExtractor={(_item, index) => index.toString()}
            renderItem={({ item, index }) => {
              let mode;
              if (examSubmission.submited) {
                mode = examGrade ? ExamItemMode.MARKED : ExamItemMode.SENT;
              } else {
                mode = ExamItemMode.FILL;
              }
              return (
                <ExamItemCard
                  mode={mode}
                  examItem={item}
                  studentAnswer={
                    examSubmission.submittedExamItems[index].answer
                  }
                  setStudentAnswer={(answer) => setStudentAnswer(index, answer)}
                  answerOk={
                    examGrade
                      ? examGrade.correctExamItems[index]
                      : examSubmission.submittedExamItems[index].correct
                  }
                  setAnswerOk={(correct) => setCorrectAnswer(index, correct)}
                />
              );
            }}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 8,
                }}
              />
            )}
            ListFooterComponent={
              !examSubmission.submited && (
                <View
                  style={{
                    paddingTop: 16,
                  }}
                >
                  <Button
                    icon="send"
                    mode="contained"
                    disabled={isLoading}
                    onPress={handleFinishExam}
                  >
                    Finalizar examen
                  </Button>
                </View>
              )
            }
          />
        </View>
      )}
      <FullScreenModal
        visible={helpModalVisible}
        onDismiss={() => setHelpModalVisible(false)}
        children={
          <View style={{ gap: 16, paddingBottom: 16 }}>
            <Text variant="titleMedium">Íconos y código de colores</Text>
            <View>
              <Text>
                Cada pregunta tiene arriba a la izquierda un ícono que indica si
                el estudiante la respondió correctamente o no:
              </Text>
              <View style={{ marginVertical: 16, gap: 8 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Icon
                    source="check-circle-outline"
                    size={24}
                    color={customColors.success}
                  />
                  <Text>Pregunta respondida correctamente</Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Icon
                    source="close-circle-outline"
                    size={24}
                    color={customColors.error}
                  />
                  <Text>Pregunta respondida incorrectamente</Text>
                </View>
              </View>

              <Text>En las preguntas con opciones:</Text>
              <View style={{ marginLeft: 16 }}>
                <Text>
                  {"\u2022"} En{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: customColors.success,
                    }}
                  >
                    verde
                  </Text>
                  : opciones correctas seleccionadas por el estudiante
                </Text>
                <Text>
                  {"\u2022"} En{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: customColors.error,
                    }}
                  >
                    rojo
                  </Text>
                  : opciones incorrectas seleccionadas por el estudiante
                </Text>
                <Text>
                  {"\u2022"} En{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: theme.colors.primary,
                    }}
                  >
                    violeta
                  </Text>
                  : opciones correctas no seleccionadas por el estudiante
                </Text>
              </View>
            </View>
            <Button mode="outlined" onPress={() => setHelpModalVisible(false)}>
              OK
            </Button>
          </View>
        }
      />
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
