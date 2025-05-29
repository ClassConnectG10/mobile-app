import {
  ExamItem,
  ExamItemAnswer,
  ExamItemType,
  MultipleChoiceAnswer,
  MultipleChoiceQuestion,
  MultipleSelectAnswer,
  MultipleSelectQuestion,
  OpenAnswer,
  OpenQuestion,
  TrueFalseAnswer,
  TrueFalseQuestion,
} from "@/types/activity";
import { Button, Card, IconButton, Text, useTheme } from "react-native-paper";
import { MultipleChoiceQuestionCard } from "./MultipleChoiceQuestionCard";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { StyleSheet, View } from "react-native";
import { MultipleSelectQuestionCard } from "./MultipleSelectQuestionCard";
import { TrueFalseQuestionCard } from "./TrueFalseQuestionCard";
import { OpenQuestionCard } from "./OpenQuestionCard";
import { ExamItemMode } from "./examItemMode";
import { customColors } from "@/utils/constants/colors";

interface ExamItemCardProps {
  examItem: ExamItem;
  mode: ExamItemMode;
  onChange?: (newQuestion: ExamItem) => void;
  onDelete?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  studentAnswer?: ExamItemAnswer;
  setStudentAnswer?: (answer: ExamItemAnswer) => void;
  answerOk?: boolean;
  setAnswerOk?: (ok: boolean) => void;
}

export const ExamItemCard: React.FC<ExamItemCardProps> = ({
  examItem,
  mode,
  onChange,
  onDelete,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  studentAnswer,
  setStudentAnswer,
  answerOk,
  setAnswerOk,
}) => {
  const theme = useTheme();

  const editableItem = mode === ExamItemMode.EDIT;
  const showCorrection =
    mode === ExamItemMode.REVIEW || mode === ExamItemMode.MARKED;

  const handleCorrectionPress = () => {
    if (mode !== ExamItemMode.REVIEW || examItem.type !== ExamItemType.OPEN)
      return;

    const newAnwerOk = answerOk === null ? true : !answerOk;
    setAnswerOk(newAnwerOk);
  };

  const correctionColor =
    answerOk === null
      ? theme.colors.primary
      : answerOk
      ? customColors.success
      : customColors.error;

  const correctionIcon =
    answerOk === null
      ? "help-circle-outline"
      : answerOk
      ? "check-circle-outline"
      : "close-circle-outline";

  return (
    <Card
      style={[
        {
          backgroundColor: theme.colors.onPrimary,
        },
        styles.card,
      ]}
    >
      <View style={{ flex: 1, gap: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            justifyContent: "space-between",
          }}
        >
          <Text variant="titleMedium">
            {examItem.type === ExamItemType.OPEN
              ? "Pregunta abierta"
              : examItem.type === ExamItemType.MULTIPLE_CHOICE
              ? "Pregunta de opción múltiple"
              : examItem.type === ExamItemType.TRUE_FALSE
              ? "Pregunta de verdadero/falso"
              : "Pregunta de selección múltiple"}
          </Text>

          <View style={{ flexDirection: "row" }}>
            {editableItem && canMoveUp && editableItem && (
              <IconButton icon="arrow-up" size={18} onPress={onMoveUp} />
            )}
            {editableItem && canMoveDown && editableItem && (
              <IconButton icon="arrow-down" size={18} onPress={onMoveDown} />
            )}

            {showCorrection && (
              <IconButton
                icon={correctionIcon}
                size={24}
                mode="contained"
                onPress={handleCorrectionPress}
                iconColor={correctionColor}
              />
            )}
          </View>
        </View>
        <ToggleableTextInput
          label="Pregunta"
          value={examItem.question}
          placeholder="Escribe la pregunta"
          editable={mode === ExamItemMode.EDIT}
          onChange={(newQuestion) => {
            onChange({ ...examItem, question: newQuestion });
          }}
        />
        {examItem.type === ExamItemType.OPEN ? (
          <OpenQuestionCard
            openQuestion={examItem as OpenQuestion}
            mode={mode}
            onChange={onChange}
            studentAnswer={studentAnswer as OpenAnswer}
            setStudentAnswer={setStudentAnswer}
          />
        ) : examItem.type === ExamItemType.MULTIPLE_CHOICE ? (
          <MultipleChoiceQuestionCard
            multipleChoiceQuestion={examItem as MultipleChoiceQuestion}
            mode={mode}
            onChange={onChange}
            studentAnswer={studentAnswer as MultipleChoiceAnswer}
            setStudentAnswer={setStudentAnswer}
            answerOk={answerOk}
            setAnswerOk={setAnswerOk}
          />
        ) : examItem.type === ExamItemType.TRUE_FALSE ? (
          <TrueFalseQuestionCard
            trueFalseQuestion={examItem as TrueFalseQuestion}
            mode={mode}
            onChange={onChange}
            studentAnswer={studentAnswer as TrueFalseAnswer}
            setStudentAnswer={setStudentAnswer}
            answerOk={answerOk}
            setAnswerOk={setAnswerOk}
          />
        ) : (
          examItem.type === ExamItemType.MULTIPLE_SELECT && (
            <MultipleSelectQuestionCard
              multipleSelectQuestion={examItem as MultipleSelectQuestion}
              mode={mode}
              onChange={onChange}
              studentAnswer={studentAnswer as MultipleSelectAnswer}
              setStudentAnswer={setStudentAnswer}
              answerOk={answerOk}
              setAnswerOk={setAnswerOk}
            />
          )
        )}
        {editableItem && (
          <Button icon="trash-can" mode="outlined" onPress={onDelete}>
            Borrar pregunta
          </Button>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    elevation: 1,
  },
});
