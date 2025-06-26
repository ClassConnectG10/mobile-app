import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { OpenAnswer, OpenQuestion } from "@/types/activity";
import { ExamItemMode } from "./examItemMode";
import { View } from "react-native";

interface OpenQuestionCardProps {
  openQuestion: OpenQuestion;
  mode: ExamItemMode;
  onChange: (newQuestion: OpenQuestion) => void;
  studentAnswer?: OpenAnswer;
  setStudentAnswer?: (answer: OpenAnswer) => void;
  autocorrected?: boolean;
  setAutocorrected?: (autocorrected: boolean) => void;
}

export const OpenQuestionCard: React.FC<OpenQuestionCardProps> = ({
  openQuestion,
  mode,
  onChange,
  studentAnswer,
  setStudentAnswer,
}) => {
  const suggestedAnswerVisible =
    mode === ExamItemMode.EDIT ||
    mode === ExamItemMode.VIEW ||
    mode === ExamItemMode.REVIEW ||
    mode === ExamItemMode.MARKED;

  const studentAnswerVisible =
    mode === ExamItemMode.FILL ||
    mode === ExamItemMode.SENT ||
    mode === ExamItemMode.REVIEW ||
    mode === ExamItemMode.MARKED;

  return (
    <View
      style={{
        gap: 8,
      }}
    >
      {suggestedAnswerVisible && (
        <ToggleableTextInput
          label="Respuesta sugerida"
          value={openQuestion.suggestedAnswer}
          placeholder="Escribe aquí una respuesta sugerida"
          editable={mode === ExamItemMode.EDIT}
          onChange={(newSuggestedAnswerText) =>
            onChange({
              ...openQuestion,
              suggestedAnswer: newSuggestedAnswerText,
            })
          }
        />
      )}

      {studentAnswerVisible && (
        <ToggleableTextInput
          label="Respuesta"
          value={studentAnswer.answer}
          placeholder="Escribe aquí una respuesta"
          editable={mode === ExamItemMode.FILL}
          onChange={(newStudentAnswerText) =>
            setStudentAnswer({ ...studentAnswer, answer: newStudentAnswerText })
          }
        />
      )}
    </View>
  );
};
