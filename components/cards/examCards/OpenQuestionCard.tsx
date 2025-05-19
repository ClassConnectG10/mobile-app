import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";
import { OpenQuestion } from "@/types/activity";

interface OpenQuestionCardProps {
  openQuestion: OpenQuestion;
  editable: boolean;
  onChange: (newQuestion: OpenQuestion) => void;
}

export const OpenQuestionCard: React.FC<OpenQuestionCardProps> = ({
  openQuestion,
  editable,
  onChange,
}) => {
  return (
    <ToggleableTextInput
      label="Respuesta sugerida"
      value={openQuestion.suggestedAnswer}
      placeholder="Escribe aquí una respuesta sugerida"
      editable={editable}
      onChange={(newSuggestedAnswer) =>
        onChange({ ...openQuestion, suggestedAnswer: newSuggestedAnswer })
      }
    />
  );
};
