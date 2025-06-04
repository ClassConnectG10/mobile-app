import {
  LEVELS,
  CATEGORIES,
  MODALITIES,
} from "@/utils/constants/courseDetails";
import { View } from "react-native";
import { Modal, Divider, Button, Text } from "react-native-paper";
import { DatePickerButton } from "../forms/DatePickerButton";
import OptionPicker from "../forms/OptionPicker";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { SearchFilters } from "@/types/course";
import { StyleSheet } from "react-native";

interface CourseFilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onApplyFilters: (searchFilter: SearchFilters) => void;
}

export const CourseFilterModal: React.FC<CourseFilterModalProps> = ({
  visible,
  onDismiss,
  onApplyFilters,
}) => {
  const searchFiltersHook = useSearchFilters();
  const {
    searchFilters,
    resetFilters,
    setStartDate,
    setEndDate,
    setLevel,
    setCategory,
    setModality,
  } = searchFiltersHook;

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}
      style={styles.modalContent}
    >
      <Text variant="titleLarge">Filtros de búsqueda</Text>

      <DatePickerButton
        label="Fecha de inicio"
        value={searchFilters.startDate}
        onChange={setStartDate}
        canReset={true}
      />

      <DatePickerButton
        label="Fecha de finalización"
        value={searchFilters.endDate}
        onChange={setEndDate}
        canReset={true}
      />

      <OptionPicker
        label="Nivel"
        value={searchFilters.level}
        items={LEVELS}
        setValue={setLevel}
      />

      <OptionPicker
        label="Categoría"
        value={searchFilters.category}
        items={CATEGORIES}
        setValue={setCategory}
      />

      <OptionPicker
        label="Modalidad"
        value={searchFilters.modality}
        items={MODALITIES}
        setValue={setModality}
      />

      <Divider />

      <View style={{ flexDirection: "row", gap: 16 }}>
        <Button
          mode="contained"
          icon="filter-remove"
          onPress={() => {
            resetFilters();
            // onApplyFilters(searchFilters);
          }}
          style={styles.modalButton}
        >
          Borrar filtros
        </Button>
        <Button
          mode="contained"
          icon="filter-check"
          onPress={() => {
            onApplyFilters(searchFilters);
            onDismiss();
          }}
          style={styles.modalButton}
        >
          Aplicar filtros
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    paddingBottom: 100,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    elevation: 5,
    gap: 16,
  },
  modalContent: {
    gap: 16,
  },
  modalButton: {
    flex: 1,
  },
});
