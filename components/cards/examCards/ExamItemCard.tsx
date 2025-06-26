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
import {
  Button,
  Card,
  Icon,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { MultipleChoiceQuestionCard } from "./MultipleChoiceQuestionCard";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { StyleSheet, View } from "react-native";
import { MultipleSelectQuestionCard } from "./MultipleSelectQuestionCard";
import { TrueFalseQuestionCard } from "./TrueFalseQuestionCard";
import { OpenQuestionCard } from "./OpenQuestionCard";
import { ExamItemMode } from "./examItemMode";
import { customColors } from "@/utils/constants/colors";
import { TextField } from "@/components/forms/TextField";

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
  autocorrected?: boolean;
  setAutocorrected?: (autocorrected: boolean) => void;
  autocorrectComment?: string | null;
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
  autocorrected,
  setAutocorrected,
  autocorrectComment,
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

  const getCorrectionIconColor = () => {
    const isEditable =
      mode === ExamItemMode.REVIEW && examItem.type === ExamItemType.OPEN;

    if (isEditable) {
      return answerOk === null
        ? theme.colors.primary
        : answerOk
        ? customColors.success
        : customColors.error;
    } else {
      return "white";
    }
  };

  const getCorrectionBackgroundColor = () => {
    const isEditable =
      mode === ExamItemMode.REVIEW && examItem.type === ExamItemType.OPEN;
    if (isEditable) {
      // Más transparente para elementos editables
      return answerOk === null
        ? theme.colors.secondaryContainer
        : answerOk
        ? customColors.success + "40"
        : customColors.error + "40";
    } else {
      // Sólido para elementos no editables
      return answerOk === null
        ? theme.colors.primary
        : answerOk
        ? customColors.success
        : customColors.error;
    }
  };

  const handleCorrectionButtonPress = () => {
    if (autocorrected) {
      setAutocorrected(false);
    }
    handleCorrectionPress();
  };

  const correctionIcon =
    answerOk === null ? "help" : answerOk ? "check" : "close";

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

            {mode === ExamItemMode.REVIEW &&
              autocorrected &&
              examItem.type === ExamItemType.OPEN && (
                <IconButton
                  icon="robot"
                  size={18}
                  mode="contained"
                  containerColor={theme.colors.secondaryContainer}
                />
              )}

            {showCorrection && (
              <IconButton
                icon={correctionIcon}
                size={18}
                mode="contained"
                onPress={handleCorrectionButtonPress}
                iconColor={getCorrectionIconColor()}
                containerColor={getCorrectionBackgroundColor()}
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
        {mode === ExamItemMode.REVIEW && autocorrectComment && (
          <TextField label="Comentario de la IA" value={autocorrectComment} />
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
