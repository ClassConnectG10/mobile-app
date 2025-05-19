import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { MultipleChoiceQuestion } from "@/types/activity";
import { View } from "react-native";
import { RadioButton, Button, IconButton } from "react-native-paper";

interface MultipleChoiceQuestionCardProps {
  multipleChoiceQuestion: MultipleChoiceQuestion;
  editable: boolean;
  onChange: (newQuestion: MultipleChoiceQuestion) => void;
}

export const MultipleChoiceQuestionCard: React.FC<
  MultipleChoiceQuestionCardProps
> = ({ multipleChoiceQuestion, editable, onChange }) => {
  return (
    <View style={{ gap: multipleChoiceQuestion.options.length > 0 ? 16 : 0 }}>
      <View style={{ gap: 8 }}>
        {multipleChoiceQuestion.options.map((option, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              gap: 8,
            }}
          >
            <RadioButton
              value=""
              status={
                multipleChoiceQuestion.correctAnswer === index
                  ? "checked"
                  : "unchecked"
              }
              disabled={!editable}
              onPress={() => {
                onChange({
                  ...multipleChoiceQuestion,
                  correctAnswer: index,
                });
              }}
            />
            <View style={{ flex: 1 }}>
              <ToggleableTextInput
                label=""
                value={option}
                placeholder=""
                editable={editable}
                onChange={(newOption) => {
                  const newOptions = [...multipleChoiceQuestion.options];
                  newOptions[index] = newOption;
                  onChange({ ...multipleChoiceQuestion, options: newOptions });
                }}
              />
            </View>
            {editable && (
              <IconButton
                icon="delete"
                size={20}
                onPress={() => {
                  const newOptions = [...multipleChoiceQuestion.options];
                  newOptions.splice(index, 1);
                  let newCorrectAnswer = multipleChoiceQuestion.correctAnswer;
                  if (index === multipleChoiceQuestion.correctAnswer) {
                    newCorrectAnswer = -1;
                  } else if (index <= multipleChoiceQuestion.correctAnswer) {
                    newCorrectAnswer = multipleChoiceQuestion.correctAnswer - 1;
                  }
                  onChange({
                    ...multipleChoiceQuestion,
                    options: newOptions,
                    correctAnswer: newCorrectAnswer,
                  });
                }}
              />
            )}
          </View>
        ))}
      </View>
      {editable && (
        <Button
          icon="plus"
          mode="outlined"
          onPress={() => {
            const newOptions = [...multipleChoiceQuestion.options];
            newOptions.push("");
            onChange({ ...multipleChoiceQuestion, options: newOptions });
          }}
        >
          Agregar opción
        </Button>
      )}
    </View>
  );
};
