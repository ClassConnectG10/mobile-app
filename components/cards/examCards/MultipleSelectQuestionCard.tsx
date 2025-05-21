import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { MultipleSelectAnswer, MultipleSelectQuestion } from "@/types/activity";
import { View } from "react-native";
import { Button, IconButton, Checkbox, useTheme } from "react-native-paper";
import { ExamItemMode } from "./examItemMode";
import { customColors } from "@/utils/constants/colors";

interface MultipleSelectQuestionCardProps {
  multipleSelectQuestion: MultipleSelectQuestion;
  mode: ExamItemMode;
  onChange: (newQuestion: MultipleSelectQuestion) => void;
  studentAnswer?: MultipleSelectAnswer;
  setStudentAnswer?: (answer: MultipleSelectAnswer) => void;
  answerOk?: boolean;
  setAnswerOk?: (ok: boolean) => void;
}

export const MultipleSelectQuestionCard: React.FC<
  MultipleSelectQuestionCardProps
> = ({
  multipleSelectQuestion,
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
  //   let newAnswerOk: boolean;

  //   if (
  //     multipleSelectQuestion.correctAnswers.length !=
  //     studentAnswer?.answers.length
  //   ) {
  //     newAnswerOk = false;
  //   } else {
  //     newAnswerOk = multipleSelectQuestion.correctAnswers.every((index) =>
  //       studentAnswer?.answers.includes(index)
  //     );
  //   }

  //   setAnswerOk(newAnswerOk);
  // }

  const handleOptionPress = (index: number) => {
    if (mode === ExamItemMode.EDIT) {
      const newCorrectAnswers = [...multipleSelectQuestion.correctAnswers];
      if (newCorrectAnswers.includes(index)) {
        newCorrectAnswers.splice(newCorrectAnswers.indexOf(index), 1);
      } else {
        newCorrectAnswers.push(index);
      }

      onChange({
        ...multipleSelectQuestion,
        correctAnswers: newCorrectAnswers,
      });
    } else if (mode === ExamItemMode.FILL) {
      const newStudentAnswers = [...studentAnswer.answers];
      if (newStudentAnswers.includes(index)) {
        newStudentAnswers.splice(newStudentAnswers.indexOf(index), 1);
      } else {
        newStudentAnswers.push(index);
      }

      setStudentAnswer({
        ...studentAnswer,
        answers: newStudentAnswers,
      });
    }
  };

  const handleOptionTextChange = (index: number, newQuestion: string) => {
    if (!editableOptions) return;

    const newOptions = [...multipleSelectQuestion.options];
    newOptions[index] = newQuestion;
    onChange({ ...multipleSelectQuestion, options: newOptions });
  };

  const handleOptionDelete = (index: number) => {
    if (!editableOptions) return;

    const newCorrectAnswers = [];
    multipleSelectQuestion.correctAnswers.forEach((correctAnswerIndex) => {
      if (correctAnswerIndex > index) {
        newCorrectAnswers.push(correctAnswerIndex - 1);
      } else if (correctAnswerIndex < index) {
        newCorrectAnswers.push(correctAnswerIndex);
      }
    });
    const newOptions = [...multipleSelectQuestion.options];
    newOptions.splice(index, 1);
    onChange({
      ...multipleSelectQuestion,
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    });
  };

  const handleOptionAdd = () => {
    const newOptions = [...multipleSelectQuestion.options];
    newOptions.push("");
    onChange({ ...multipleSelectQuestion, options: newOptions });
  };

  const getCheckBoxStatus = (index: number): "checked" | "unchecked" => {
    let buttonChecked = false;
    if (mode === ExamItemMode.EDIT || mode === ExamItemMode.VIEW) {
      buttonChecked = multipleSelectQuestion.correctAnswers.includes(index);
    } else if (mode === ExamItemMode.FILL || mode === ExamItemMode.SENT) {
      buttonChecked =
        studentAnswer.answers !== null && studentAnswer.answers.includes(index);
    } else if (mode === ExamItemMode.REVIEW || mode === ExamItemMode.MARKED) {
      buttonChecked =
        multipleSelectQuestion.correctAnswers.includes(index) ||
        studentAnswer.answers.includes(index);
    }
    return buttonChecked ? "checked" : "unchecked";
  };

  const getCheckBoxColor = (index: number): string => {
    if (
      mode === ExamItemMode.EDIT ||
      mode === ExamItemMode.VIEW ||
      mode === ExamItemMode.FILL ||
      mode === ExamItemMode.SENT
    ) {
      return theme.colors.primary;
    } else if (mode === ExamItemMode.REVIEW || mode === ExamItemMode.MARKED) {
      if (studentAnswer.answers.includes(index)) {
        return multipleSelectQuestion.correctAnswers.includes(index)
          ? customColors.success
          : customColors.error;
      } else if (multipleSelectQuestion.correctAnswers.includes(index)) {
        return theme.colors.primary;
      }
    }
  };

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
              status={getCheckBoxStatus(index)}
              color={getCheckBoxColor(index)}
              onPress={() => {
                handleOptionPress(index);
              }}
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
                  handleOptionDelete(index);
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
