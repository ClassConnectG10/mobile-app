import { TrueFalseAnswer, TrueFalseQuestion } from "@/types/activity";
import { View } from "react-native";
import { RadioButton, Text, useTheme } from "react-native-paper";
import { ExamItemMode } from "./examItemMode";
import { customColors } from "@/utils/constants/colors";

interface TrueFalseQuestionCardProps {
  trueFalseQuestion: TrueFalseQuestion;
  mode: ExamItemMode;
  onChange: (newQuestion: TrueFalseQuestion) => void;
  studentAnswer?: TrueFalseAnswer;
  setStudentAnswer?: (answer: TrueFalseAnswer) => void;
  answerOk?: boolean;
  setAnswerOk?: (ok: boolean) => void;
}

export const TrueFalseQuestionCard: React.FC<TrueFalseQuestionCardProps> = ({
  trueFalseQuestion,
  mode,
  onChange,
  studentAnswer,
  setStudentAnswer,
  answerOk,
  setAnswerOk,
}) => {
  const theme = useTheme();

  if (mode === ExamItemMode.REVIEW) {
    setAnswerOk(trueFalseQuestion.correctAnswer === studentAnswer?.answer);
  }

  const handleOptionPress = (option: boolean) => {
    if (mode === ExamItemMode.EDIT) {
      onChange({
        ...trueFalseQuestion,
        correctAnswer: option,
      });
    } else if (mode === ExamItemMode.FILL) {
      setStudentAnswer({ ...studentAnswer, answer: option });
    }
  };

  const getRadioButtonStatus = (option: boolean): "checked" | "unchecked" => {
    let buttonChecked = false;
    if (mode === ExamItemMode.EDIT || mode === ExamItemMode.VIEW) {
      buttonChecked =
        trueFalseQuestion.correctAnswer !== null &&
        trueFalseQuestion.correctAnswer === option;
    } else if (mode === ExamItemMode.FILL || mode === ExamItemMode.SENT) {
      buttonChecked =
        studentAnswer.answer !== null && studentAnswer.answer === option;
    } else if (mode === ExamItemMode.REVIEW || mode === ExamItemMode.MARKED) {
      buttonChecked =
        trueFalseQuestion.correctAnswer === option ||
        studentAnswer.answer === option;
    }
    return buttonChecked ? "checked" : "unchecked";
  };

  const getRadioButtonColor = (option: boolean): string => {
    if (
      mode === ExamItemMode.EDIT ||
      mode === ExamItemMode.VIEW ||
      mode === ExamItemMode.FILL ||
      mode === ExamItemMode.SENT
    ) {
      return theme.colors.primary;
    } else if (mode === ExamItemMode.REVIEW || mode === ExamItemMode.MARKED) {
      if (option === studentAnswer.answer) {
        return answerOk ? customColors.success : customColors.error;
      } else if (option === trueFalseQuestion.correctAnswer) {
        return theme.colors.primary;
      }
    }
  };

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
          status={getRadioButtonStatus(true)}
          onPress={() => {
            handleOptionPress(true);
          }}
          color={getRadioButtonColor(true)}
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
          status={getRadioButtonStatus(false)}
          onPress={() => {
            handleOptionPress(false);
          }}
          color={getRadioButtonColor(false)}
        />
        <Text variant="bodyLarge">Falso</Text>
      </View>
    </View>
  );
};
