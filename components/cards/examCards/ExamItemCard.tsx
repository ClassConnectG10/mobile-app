import {
  ExamItem,
  ExamItemType,
  MultipleChoiceQuestion,
  MultipleSelectQuestion,
  OpenQuestion,
  TrueFalseQuestion,
} from "@/types/activity";
import { Button, Card, IconButton, Text, useTheme } from "react-native-paper";
import { MultipleChoiceQuestionCard } from "./MultipleChoiceQuestionCard";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { StyleSheet, View } from "react-native";
import { MultipleSelectQuestionCard } from "./MultipleSelectQuestionCard";
import { TrueFalseQuestionCard } from "./TrueFalseQuestionCard";
import { OpenQuestionCard } from "./OpenQuestionCard";

interface ExamItemCardProps {
  examItem: ExamItem;
  editable: boolean;
  onChange: (newQuestion: ExamItem) => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const ExamItemCard: React.FC<ExamItemCardProps> = ({
  examItem,
  editable,
  onChange,
  onDelete,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}) => {
  const theme = useTheme();

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
            {canMoveUp && editable && (
              <IconButton icon="arrow-up" size={18} onPress={onMoveUp} />
            )}
            {canMoveDown && editable && (
              <IconButton icon="arrow-down" size={18} onPress={onMoveDown} />
            )}
          </View>
        </View>
        <ToggleableTextInput
          label="Pregunta"
          value={examItem.question}
          placeholder="Escribe la pregunta"
          editable={editable}
          onChange={(newQuestion) => {
            onChange({ ...examItem, question: newQuestion });
          }}
        />
        {examItem.type === ExamItemType.OPEN ? (
          <OpenQuestionCard
            openQuestion={examItem as OpenQuestion}
            editable={editable}
            onChange={onChange}
          />
        ) : examItem.type === ExamItemType.MULTIPLE_CHOICE ? (
          <MultipleChoiceQuestionCard
            multipleChoiceQuestion={examItem as MultipleChoiceQuestion}
            editable={editable}
            onChange={onChange}
          />
        ) : examItem.type === ExamItemType.TRUE_FALSE ? (
          <TrueFalseQuestionCard
            trueFalseQuestion={examItem as TrueFalseQuestion}
            editable={editable}
            onChange={onChange}
          />
        ) : (
          examItem.type === ExamItemType.MULTIPLE_SELECT && (
            <MultipleSelectQuestionCard
              multipleSelectQuestion={examItem as MultipleSelectQuestion}
              editable={editable}
              onChange={onChange}
            />
          )
        )}
        {editable && (
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
