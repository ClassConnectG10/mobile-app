import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { MultipleChoiceAnswer, MultipleChoiceQuestion } from "@/types/activity";
import { View } from "react-native";
import { RadioButton, Button, IconButton, useTheme } from "react-native-paper";
import { ExamItemMode } from "./examItemMode";
import { customColors } from "@/utils/constants/colors";

interface MultipleChoiceQuestionCardProps {
  multipleChoiceQuestion: MultipleChoiceQuestion;
  mode: ExamItemMode;
  onChange: (newQuestion: MultipleChoiceQuestion) => void;
  studentAnswer?: MultipleChoiceAnswer;
  setStudentAnswer?: (answer: MultipleChoiceAnswer) => void;
  answerOk?: boolean;
  setAnswerOk?: (ok: boolean) => void;
}

export const MultipleChoiceQuestionCard: React.FC<
  MultipleChoiceQuestionCardProps
> = ({
  multipleChoiceQuestion,
  mode,
  onChange,
  studentAnswer,
  setStudentAnswer,
  answerOk,
  setAnswerOk,
}) => {
  const theme = useTheme();

  const editableOptions = mode === ExamItemMode.EDIT;

  // if (
  //   mode === ExamItemMode.REVIEW &&
  //   (answerOk === null || answerOk === undefined)
  // ) {
  //   setAnswerOk(multipleChoiceQuestion.correctAnswer === studentAnswer.answer);
  //   setAnswerOk(true);
  // }

  const handleOptionPress = (index: number) => {
    if (mode === ExamItemMode.EDIT) {
      onChange({
        ...multipleChoiceQuestion,
        correctAnswer: index,
      });
    } else if (mode === ExamItemMode.FILL) {
      setStudentAnswer({ ...studentAnswer, answer: index });
    }
  };

  const handleOptionTextChange = (index: number, newQuestion: string) => {
    if (!editableOptions) return;

    const newOptions = [...multipleChoiceQuestion.options];
    newOptions[index] = newQuestion;
    onChange({ ...multipleChoiceQuestion, options: newOptions });
  };

  const handleDeleteQuestion = (index: number) => {
    if (!editableOptions) return;

    const newOptions = [...multipleChoiceQuestion.options];
    newOptions.splice(index, 1);
    let newCorrectAnswer = multipleChoiceQuestion.correctAnswer;
    if (index === multipleChoiceQuestion.correctAnswer) {
      newCorrectAnswer = null;
    } else if (index < multipleChoiceQuestion.correctAnswer) {
      newCorrectAnswer = multipleChoiceQuestion.correctAnswer - 1;
    }
    onChange({
      ...multipleChoiceQuestion,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    });
  };

  const handleOptionAdd = () => {
    const newOptions = [...multipleChoiceQuestion.options];
    newOptions.push("");
    onChange({ ...multipleChoiceQuestion, options: newOptions });
  };

  const getRadioButtonStatus = (index: number): "checked" | "unchecked" => {
    let buttonChecked = false;
    if (mode === ExamItemMode.EDIT || mode === ExamItemMode.VIEW) {
      buttonChecked = multipleChoiceQuestion.correctAnswer === index;
    } else if (mode === ExamItemMode.FILL || mode === ExamItemMode.SENT) {
      buttonChecked = studentAnswer.answer === index;
    } else if (mode === ExamItemMode.REVIEW || mode === ExamItemMode.MARKED) {
      buttonChecked =
        multipleChoiceQuestion.correctAnswer === index ||
        studentAnswer.answer === index;
    }
    return buttonChecked ? "checked" : "unchecked";
  };

  const getRadioButtonColor = (index: number): string => {
    if (
      mode === ExamItemMode.EDIT ||
      mode === ExamItemMode.VIEW ||
      mode === ExamItemMode.FILL ||
      mode === ExamItemMode.SENT
    ) {
      return theme.colors.primary;
    } else if (mode === ExamItemMode.REVIEW || mode === ExamItemMode.MARKED) {
      if (index === studentAnswer.answer) {
        return answerOk ? customColors.success : customColors.error;
      } else if (index === multipleChoiceQuestion.correctAnswer) {
        return theme.colors.primary;
      }
    }
  };

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
              status={getRadioButtonStatus(index)}
              onPress={() => {
                handleOptionPress(index);
              }}
              color={getRadioButtonColor(index)}
            />
            <View style={{ flex: 1 }}>
              <ToggleableTextInput
                label=""
                value={option}
                placeholder=""
                editable={editableOptions}
                onChange={(newOption) => {
                  handleOptionTextChange(index, newOption);
                }}
              />
            </View>
            {editableOptions && (
              <IconButton
                icon="delete"
                size={20}
                onPress={() => {
                  handleDeleteQuestion(index);
                }}
              />
            )}
          </View>
        ))}
      </View>
      {editableOptions && (
        <Button icon="plus" mode="outlined" onPress={handleOptionAdd}>
          Agregar opción
        </Button>
      )}
    </View>
  );
};
