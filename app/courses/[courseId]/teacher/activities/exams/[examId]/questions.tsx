import { DatePickerButton } from "@/components/forms/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  ExamDetails,
  ExamItem,
  ExamItemType,
  MultipleChoiceQuestion,
  MultipleSelectQuestion,
  OpenQuestion,
  TrueFalseQuestion,
} from "@/types/activity";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState, useRef } from "react";
import { View, FlatList } from "react-native";
import { Appbar, Button, Divider, TextInput, Text } from "react-native-paper";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { FullScreenModal } from "@/components/FullScreenModal";
import { useExamDetails } from "@/hooks/useExamDetails";
import { ExamItemCard } from "@/components/cards/examCards/ExamItemCard";
import { examDetailsSchema } from "@/validations/activities";
import OptionPicker from "@/components/forms/OptionPicker";
import { BiMap } from "@/utils/bimap";
import { AlertText } from "@/components/AlertText";
import { useFocusEffect } from "@react-navigation/native";
import {
  getTeacherExam,
  updateTeacherExam,
} from "@/services/activityManagement";
import { ExamItemMode } from "@/components/cards/examCards/examItemMode";

export default function CreateExam() {
  const router = useRouter();

  const { courseId: courseIdParam, examId: examIdParam } =
    useLocalSearchParams();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courseModulesBiMap, setCourseModulesBiMap] = useState<BiMap>(
    new BiMap()
  );

  const courseId = courseIdParam as string;
  const examId = examIdParam as string;

  const examDetailsHook = useExamDetails();
  const examDetails = examDetailsHook.examDetails;

  const [isEditing, setIsEditing] = useState(false);
  const [teacherExam, setTeacherExam] = useState(null);

  const [examItemTypeSelectorVisible, setExamItemTypeSelectorVisible] =
    useState(false);

  const flatListRef = useRef<FlatList>(null);

  async function fetchTeacherExam() {
    if (!courseId || !examId) return;
    setIsLoading(true);

    try {
      const teacherExam = await getTeacherExam(courseId, Number(examId));
      setTeacherExam(teacherExam);
      examDetailsHook.setExamDetails(
        teacherExam.activity.activityDetails as ExamDetails
      );
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditExam = async () => {
    setIsLoading(true);

    try {
      examDetailsSchema.parse(examDetails);
      await updateTeacherExam(courseId, Number(examId), examDetails);

      setTeacherExam({
        ...teacherExam,
        activity: {
          ...teacherExam.activity,
          activityDetails: examDetails,
        },
      });
      setIsEditing(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExamItem = async (examItemType: ExamItemType) => {
    let examItem: ExamItem;
    if (examItemType === ExamItemType.OPEN) {
      examItem = new OpenQuestion("", "");
    } else if (examItemType === ExamItemType.MULTIPLE_CHOICE) {
      examItem = new MultipleChoiceQuestion("", []);
    } else if (examItemType === ExamItemType.TRUE_FALSE) {
      examItem = new TrueFalseQuestion("");
    } else if (examItemType === ExamItemType.MULTIPLE_SELECT) {
      examItem = new MultipleSelectQuestion("", [], []);
    }

    examDetailsHook.setExamItems([...examDetails.examItems, examItem]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 250);
  };

  const handleDiscardChanges = () => {
    if (teacherExam) {
      examDetailsHook.setExamDetails({
        ...(teacherExam.activity.activityDetails as ExamDetails),
      });
    }
    setIsEditing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeacherExam();
    }, [courseId, examId])
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={
            isEditing ? () => handleDiscardChanges() : () => router.back()
          }
        />
        <Appbar.Content
          title={isEditing ? "Editado las preguntas" : "Preguntas del examen"}
        />
        {teacherExam && !teacherExam.visible && (
          <Appbar.Action
            icon={isEditing ? "check" : "pencil"}
            onPress={isEditing ? handleEditExam : () => setIsEditing(true)}
          />
        )}
      </Appbar.Header>
      <View
        style={{
          padding: 16,
          flex: 1,
        }}
      >
        <FlatList
          ref={flatListRef}
          data={examDetails.examItems}
          keyExtractor={(_item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <ExamItemCard
              mode={isEditing ? ExamItemMode.EDIT : ExamItemMode.VIEW}
              examItem={item}
              onChange={(examItem) => {
                const newExamItems = [...examDetails.examItems];
                newExamItems[index] = examItem;
                examDetailsHook.setExamItems(newExamItems);
              }}
              onDelete={() => {
                const newExamItems = [...examDetails.examItems];
                newExamItems.splice(index, 1);
                examDetailsHook.setExamItems(newExamItems);
              }}
              canMoveUp={index > 0}
              canMoveDown={index < examDetails.examItems.length - 1}
              onMoveUp={() => {
                const newExamItems = [...examDetails.examItems];
                const itemToMove = newExamItems[index];
                newExamItems[index] = newExamItems[index - 1];
                newExamItems[index - 1] = itemToMove;
                examDetailsHook.setExamItems(newExamItems);
              }}
              onMoveDown={() => {
                const newExamItems = [...examDetails.examItems];
                const itemToMove = newExamItems[index];
                newExamItems[index] = newExamItems[index + 1];
                newExamItems[index + 1] = itemToMove;
                examDetailsHook.setExamItems(newExamItems);
              }}
            />
          )}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 8,
              }}
            />
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text variant="titleMedium" style={{ textAlign: "center" }}>
                Para añadir preguntas, presione el + en la parte inferior
                derecha de la pantalla.
              </Text>
            </View>
          }
        />
      </View>
      {isEditing && (
        <FloatingActionButton
          onPress={() => {
            setExamItemTypeSelectorVisible(true);
          }}
        />
      )}
      <FullScreenModal
        visible={examItemTypeSelectorVisible}
        onDismiss={() => setExamItemTypeSelectorVisible(false)}
        children={
          <>
            <Button
              mode="contained"
              icon="text-box"
              onPress={() => {
                handleAddExamItem(ExamItemType.OPEN);
                setExamItemTypeSelectorVisible(false);
              }}
            >
              Crear pregunta abierta
            </Button>
            <Button
              mode="contained"
              icon="radiobox-marked"
              onPress={() => {
                handleAddExamItem(ExamItemType.MULTIPLE_CHOICE);
                setExamItemTypeSelectorVisible(false);
              }}
            >
              Crear pregunta de opción múltiple
            </Button>
            <Button
              mode="contained"
              icon="check-circle"
              onPress={() => {
                handleAddExamItem(ExamItemType.TRUE_FALSE);
                setExamItemTypeSelectorVisible(false);
              }}
            >
              Crear pregunta de verdadero o falso
            </Button>
            <Button
              mode="contained"
              icon="checkbox-multiple-marked"
              onPress={() => {
                handleAddExamItem(ExamItemType.MULTIPLE_SELECT);
                setExamItemTypeSelectorVisible(false);
              }}
            >
              Crear pregunta de selección múltiple
            </Button>
          </>
        }
      />

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
