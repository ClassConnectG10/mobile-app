import { View } from "react-native";
import { Divider, Button, Text } from "react-native-paper";
import { DatePickerButton } from "../forms/DatePickerButton";
import { FullScreenModal } from "../FullScreenModal";
import { CourseReviewSearchParams } from "@/types/course";
import { useCourseReviewSearchParams } from "@/hooks/useCourseReviewSearchParams";
import ReviewPicker from "../forms/ReviewPicker";

interface CourseReviewFilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onApplySearchParams: (
    courseReviewSearchParams: CourseReviewSearchParams,
  ) => void;
}

export const CourseReviewFilterModal: React.FC<
  CourseReviewFilterModalProps
> = ({ visible, onDismiss, onApplySearchParams }) => {
  const courseReviewSearchParamsHook = useCourseReviewSearchParams();
  const {
    courseReviewSearchParams,
    setStartDate,
    setEndDate,
    setMark,
    resetFilters,
  } = courseReviewSearchParamsHook;

  return (
    <FullScreenModal visible={visible} onDismiss={onDismiss}>
      <Text variant="titleLarge">Filtros de búsqueda</Text>

      <Text variant="bodyMedium">Cantidad de estrellas</Text>

      <ReviewPicker
        editable={true}
        value={courseReviewSearchParams.mark}
        onChange={setMark}
      />

      <DatePickerButton
        label="Fecha de inicio"
        value={courseReviewSearchParams.startDate}
        onChange={setStartDate}
        canReset={true}
      />

      <DatePickerButton
        label="Fecha de finalización"
        value={courseReviewSearchParams.endDate}
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
            onApplySearchParams(courseReviewSearchParams);
            onDismiss();
          }}
        >
          Aplicar filtros
        </Button>
      </View>
    </FullScreenModal>
  );
};
