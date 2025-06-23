import { View } from "react-native";
import { Divider, Button, Text } from "react-native-paper";
import { DatePickerButton } from "../forms/DatePickerButton";
import OptionPicker from "../forms/OptionPicker";
import { FullScreenModal } from "../FullScreenModal";
import { CourseFeedbackSearchParams } from "@/types/course";
import { FEEDBACK_TYPES_OPTIONS } from "@/utils/constants/courseFeedbackSearchParams";
import { useCourseFeedbackSearchParams } from "@/hooks/useCourseFeedbackSearchParams";

interface CourseFeedbackFilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onApplySearchParams: (
    courseFeedbackSearchParams: CourseFeedbackSearchParams
  ) => void;
}

export const CourseFeedbackFilterModal: React.FC<
  CourseFeedbackFilterModalProps
> = ({ visible, onDismiss, onApplySearchParams }) => {
  const courseFeedbackSearchParamsHook = useCourseFeedbackSearchParams();
  const {
    courseFeedbackSearchParams,
    setStartDate,
    setEndDate,
    setFeedbackType,
    resetFilters,
  } = courseFeedbackSearchParamsHook;

  return (
    <FullScreenModal visible={visible} onDismiss={onDismiss}>
      <Text variant="titleLarge">Filtros de búsqueda</Text>

      <OptionPicker
        label="Condición"
        value={courseFeedbackSearchParams.feedbackType}
        items={FEEDBACK_TYPES_OPTIONS}
        setValue={setFeedbackType}
        canReset={false}
      />

      <DatePickerButton
        label="Fecha de inicio"
        value={courseFeedbackSearchParams.startDate}
        onChange={setStartDate}
        canReset={true}
      />

      <DatePickerButton
        label="Fecha de finalización"
        value={courseFeedbackSearchParams.endDate}
        onChange={setEndDate}
        canReset={true}
      />

      <Divider />

      <View style={{ flexDirection: "row", gap: 16 }}>
        <Button
          mode="contained"
          icon="filter-remove"
          onPress={() => {
            resetFilters();
          }}
        >
          Borrar filtros
        </Button>
        <Button
          mode="contained"
          icon="filter-check"
          onPress={() => {
            onApplySearchParams(courseFeedbackSearchParams);
            onDismiss();
          }}
        >
          Aplicar filtros
        </Button>
      </View>
    </FullScreenModal>
  );
};
