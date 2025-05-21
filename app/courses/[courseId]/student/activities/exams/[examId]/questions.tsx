import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { ExamDetails, ExamItemAnswer } from "@/types/activity";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import {
  Appbar,
  Button,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { ExamItemCard } from "@/components/cards/examCards/ExamItemCard";
import { useFocusEffect } from "@react-navigation/native";
import {
  getExamSubmission,
  getStudentExam,
  submitExam,
} from "@/services/activityManagement";
import { ExamItemMode } from "@/components/cards/examCards/examItemMode";
import { useUserContext } from "@/utils/storage/userContext";

export default function StudentFillExam() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, examId: examIdParam } =
    useLocalSearchParams();

  const courseId = courseIdParam as string;
  const examId = Number(examIdParam);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [studentExam, setStudentExam] = useState(null);
  const [examDetails, setExamDetails] = useState(null);
  const [examSubmission, setExamSubmission] = useState(null);

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
            renderItem={({ item, index }) => (
              <ExamItemCard
                mode={
                  examSubmission.submited
                    ? ExamItemMode.SENT
                    : ExamItemMode.FILL
                }
                examItem={item}
                studentAnswer={examSubmission.submittedExamItems[index].answer}
                setStudentAnswer={(answer) => setStudentAnswer(index, answer)}
                answerOk={examSubmission.submittedExamItems[index].correct}
                setAnswerOk={(correct) => setCorrectAnswer(index, correct)}
              />
            )}
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

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
