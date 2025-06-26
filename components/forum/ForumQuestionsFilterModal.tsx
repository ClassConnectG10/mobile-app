import { ORDER_OPTIONS } from "@/utils/constants/forumSearchParams";
import { View } from "react-native";
import { Divider, Button, Text } from "react-native-paper";
import { DatePickerButton } from "../forms/DatePickerButton";
import OptionPicker from "../forms/OptionPicker";
import { useForumSearchParams } from "@/hooks/useForumSearchParams";
import { ToggleableTagsInput } from "../forms/ToggleableTagsInput";
import { ForumSearchParams } from "@/types/forum";
import { FullScreenModal } from "../FullScreenModal";

interface ForumQuestionsFilterModalProps {
  visible: boolean;
  showTagsPicker?: boolean;
  onDismiss: () => void;
  onApplySearchParams: (forumSearchParams: ForumSearchParams) => void;
}

export const ForumQuestionsFilterModal: React.FC<
  ForumQuestionsFilterModalProps
> = ({ visible, showTagsPicker = true, onDismiss, onApplySearchParams }) => {
  const forumSearchParamsHook = useForumSearchParams();
  const {
    forumSearchParams,
    setStartDate,
    setEndDate,
    setTags,
    setOrderBy,
    resetFilters,
  } = forumSearchParamsHook;

  return (
    // <View style={{ flexDirection: "row" }}>
    <FullScreenModal visible={visible} onDismiss={onDismiss}>
      <Text variant="titleLarge">Filtros de búsqueda</Text>

      <OptionPicker
        label="Ordenar por"
        value={forumSearchParams.orderBy}
        items={ORDER_OPTIONS}
        setValue={setOrderBy}
        canReset={false}
      />

      <DatePickerButton
        label="Fecha de inicio"
        value={forumSearchParams.startDate}
        onChange={setStartDate}
        canReset={true}
      />

      <DatePickerButton
        label="Fecha de finalización"
        value={forumSearchParams.endDate}
        onChange={setEndDate}
        canReset={true}
      />
      {showTagsPicker && (
        <View>
          <Text variant="labelLarge">Tags de búsqueda</Text>

          <ToggleableTagsInput
            tags={forumSearchParams.tags}
            onChange={setTags}
            editable={true}
            maxTags={5}
          />
        </View>
      )}

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
            onApplySearchParams(forumSearchParams);
            onDismiss();
          }}
        >
          Aplicar filtros
        </Button>
      </View>
    </FullScreenModal>
    // </View>
  );
};
