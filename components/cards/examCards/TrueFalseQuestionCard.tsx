import { TrueFalseQuestion } from "@/types/activity";
import { View } from "react-native";
import { RadioButton, Text } from "react-native-paper";

interface TrueFalseQuestionCardProps {
  trueFalseQuestion: TrueFalseQuestion;
  editable: boolean;
  onChange: (newQuestion: TrueFalseQuestion) => void;
}

export const TrueFalseQuestionCard: React.FC<TrueFalseQuestionCardProps> = ({
  trueFalseQuestion,
  editable,
  onChange,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          flex: 1,
          justifyContent: "flex-start",
        }}
      >
        <RadioButton
          value="Verdadero"
          disabled={!editable}
          status={
            trueFalseQuestion.correctAnswer !== undefined &&
            trueFalseQuestion.correctAnswer
              ? "checked"
              : "unchecked"
          }
          onPress={() => {
            onChange({
              ...trueFalseQuestion,
              correctAnswer: true,
            });
          }}
        />
        <Text variant="bodyLarge">Verdadero</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          flex: 1,
          justifyContent: "flex-start",
        }}
      >
        <RadioButton
          value="Falso"
          disabled={!editable}
          status={
            trueFalseQuestion.correctAnswer !== undefined &&
            !trueFalseQuestion.correctAnswer
              ? "checked"
              : "unchecked"
          }
          onPress={() => {
            onChange({
              ...trueFalseQuestion,
              correctAnswer: false,
            });
          }}
        />
        <Text variant="bodyLarge">Falso</Text>
      </View>
    </View>
  );
};
