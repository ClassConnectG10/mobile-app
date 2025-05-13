import {
  levels,
  categories,
  modalities,
} from "@/utils/constants/courseDetails";
import { View } from "react-native";
import {
  Modal,
  IconButton,
  Divider,
  Button,
  Text,
  useTheme,
} from "react-native-paper";
import { DatePickerButton } from "./DatePickerButton";
import OptionPicker from "./OptionPicker";
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
  const theme = useTheme();
  const searchFiltersHook = useSearchFilters();
  const searchFilters = searchFiltersHook.searchFilters;
  return (
    <Modal
      visible={visible}
      onDismiss={() => {
        onDismiss();
      }}
      contentContainerStyle={styles.modalContainer}
      style={styles.modalContent}
    >
      <Text variant="titleLarge">Filtros de búsqueda</Text>

      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <DatePickerButton
          label="Fecha de inicio"
          value={searchFilters.startDate}
          onChange={searchFiltersHook.setStartDate}
        />
        <IconButton
          icon="reload"
          mode="contained"
          iconColor={theme.colors.primary}
          size={20}
          onPress={() => {
            searchFiltersHook.setStartDate(null);
          }}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <DatePickerButton
          label="Fecha de finalización"
          value={searchFilters.endDate}
          onChange={searchFiltersHook.setEndDate}
        />
        <IconButton
          icon="reload"
          mode="contained"
          iconColor={theme.colors.primary}
          size={20}
          onPress={() => {
            searchFiltersHook.setEndDate(null);
          }}
        />
      </View>

      <OptionPicker
        label="Nivel"
        value={searchFilters.level}
        items={levels}
        setValue={searchFiltersHook.setLevel}
      />
      <OptionPicker
        label="Categoría"
        value={searchFilters.category}
        items={categories}
        setValue={searchFiltersHook.setCategory}
      />

      <OptionPicker
        label="Modalidad"
        value={searchFilters.modality}
        items={modalities}
        setValue={searchFiltersHook.setModality}
      />

      <Divider />
      <View style={{ flexDirection: "row", gap: 20 }}>
        <Button
          mode="contained"
          icon="filter-remove"
          onPress={() => {
            searchFiltersHook.resetSearchFilters;
            onApplyFilters(searchFilters);
          }}
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
    marginTop: 20,
    backgroundColor: "#6200ee",
    borderRadius: 4,
    padding: 10,
    color: "white",
  },
});
