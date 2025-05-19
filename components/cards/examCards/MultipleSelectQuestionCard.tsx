import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { MultipleSelectQuestion } from "@/types/activity";
import { View } from "react-native";
import { Button, IconButton, Checkbox } from "react-native-paper";

interface MultipleSelectQuestionCardProps {
  multipleSelectQuestion: MultipleSelectQuestion;
  editable: boolean;
  onChange: (newQuestion: MultipleSelectQuestion) => void;
}

export const MultipleSelectQuestionCard: React.FC<
  MultipleSelectQuestionCardProps
> = ({ multipleSelectQuestion, editable, onChange }) => {
  return (
    <View style={{ gap: multipleSelectQuestion.options.length > 0 ? 16 : 0 }}>
      <View style={{ gap: 8 }}>
        {multipleSelectQuestion.options.map((option, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              gap: 8,
            }}
          >
            <Checkbox
              status={
                multipleSelectQuestion.correctAnswers.includes(index)
                  ? "checked"
                  : "unchecked"
              }
              disabled={!editable}
              onPress={() => {
                const newCorrectAnswers = [
                  ...multipleSelectQuestion.correctAnswers,
                ];
                if (newCorrectAnswers.includes(index)) {
                  newCorrectAnswers.splice(newCorrectAnswers.indexOf(index), 1);
                } else {
                  newCorrectAnswers.push(index);
                }

                onChange({
                  ...multipleSelectQuestion,
                  correctAnswers: newCorrectAnswers,
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
                  const newOptions = [...multipleSelectQuestion.options];
                  newOptions[index] = newOption;
                  onChange({ ...multipleSelectQuestion, options: newOptions });
                }}
              />
            </View>
            {editable && (
              <IconButton
                icon="delete"
                size={20}
                onPress={() => {
                  const newOptions = [...multipleSelectQuestion.options];
                  newOptions.splice(index, 1);
                  onChange({ ...multipleSelectQuestion, options: newOptions });
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
            const newOptions = [...multipleSelectQuestion.options];
            newOptions.push("");
            onChange({ ...multipleSelectQuestion, options: newOptions });
          }}
        >
          Agregar opción
        </Button>
      )}
    </View>
  );
};
