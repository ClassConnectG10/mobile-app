import { DatePickerButton } from "@/components/forms/DatePickerButton";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { getCourseModuleId } from "@/services/activityManagement";
import { globalStyles } from "@/styles/globalStyles";
import {
  ActivityType,
  ExamItem,
  ExamItemType,
  MultipleChoiceQuestion,
  MultipleSelectQuestion,
  OpenQuestion,
  TrueFalseQuestion,
} from "@/types/activity";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ScrollView, FlatList } from "react-native";
import {
  Appbar,
  Button,
  Divider,
  TextInput,
  useTheme,
  Text,
} from "react-native-paper";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { FullScreenModal } from "@/components/FullScreenModal";
import { useExamDetails } from "@/hooks/useExamDetails";
import { ExamItemCard } from "@/components/cards/examCards/ExamItemCard";
import { examDetailsSchema } from "@/validations/activities";
import { ZodError } from "zod";
import { handleError } from "@/services/errorHandling";
import OptionPicker from "@/components/forms/OptionPicker";
import { getCourseModules } from "@/services/resourceManager";
import { Module } from "@/types/resources";
import { BiMap } from "@/utils/bimap";

export default function CreateActivity() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, activityType: activityTypeParam } =
    useLocalSearchParams();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courseModulesBiMap, setCourseModulesBiMap] = useState<BiMap>(
    new BiMap()
  );

  const courseId = courseIdParam as string;

  const examDetailsHook = useExamDetails();
  const examDetails = examDetailsHook.examDetails;

  const [examItemTypeSelectorVisible, setExamItemTypeSelectorVisible] =
    useState(false);

  const fetchCourseModules = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const courseModules = await getCourseModules(courseId);
      console.log("courseModules", courseModules);
      const bimap = new BiMap(
        courseModules.map((module) => [
          module.courseModuleDetails.title,
          module.moduleId.toString(),
        ])
      );
      console.log("AAAAA", bimap);
      setCourseModulesBiMap(bimap);
    } catch (error) {
      const newError = handleError(error, "cargar los módulos del curso");
      setErrorMessage(newError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExam = async () => {
    setIsLoading(true);

    try {
      examDetailsSchema.parse(examDetails);
      const moduleId = await getCourseModuleId(courseId);
      // await createExam(courseId, moduleId, activityDetails);
      router.back();
    } catch (error) {
      const newError = handleError(error, "crear un examen");
      setErrorMessage(newError.message);
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
  };

  useEffect(() => {
    fetchCourseModules();
  }, [courseId]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Nuevo examen"} />
      </Appbar.Header>
      <View
        style={{
          padding: 16,
          flex: 1,
        }}
      >
        <FlatList
          data={examDetails.examItems}
          keyExtractor={(_item, index) => index.toString()}
          ListHeaderComponent={
            <View style={{ gap: 16, paddingBottom: 16 }}>
              <TextInput
                placeholder="Titulo"
                value={examDetails.title}
                onChangeText={examDetailsHook.setTitle}
              />

              <TextInput
                placeholder="Instrucciones"
                value={examDetails.instructions}
                onChangeText={examDetailsHook.setInstructions}
              />

              <DatePickerButton
                label="Fecha límite"
                type="datetime"
                value={examDetails.dueDate}
                onChange={examDetailsHook.setDueDate}
              />

              <OptionPicker
                label="Módulo"
                value={examDetails.moduleId?.toString()}
                items={courseModulesBiMap}
                setValue={(newValue: string) => {
                  examDetailsHook.setModuleId(Number(newValue));
                }}
              />

              <Divider />
            </View>
          }
          renderItem={({ item, index }) => (
            <ExamItemCard
              editable={true}
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
          ListFooterComponent={
            <View
              style={{
                gap: 16,
                paddingTop: 16,
              }}
            >
              <Divider />
              <Button
                onPress={handleCreateExam}
                icon="test-tube"
                mode="contained"
                disabled={isLoading || examDetails.examItems.length === 0}
              >
                Crear examen
              </Button>
            </View>
          }
        />
      </View>
      <FloatingActionButton
        onPress={() => setExamItemTypeSelectorVisible(true)}
      />

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
