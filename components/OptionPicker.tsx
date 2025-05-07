import { StyleSheet, View, Text } from "react-native";
import { Dropdown } from "react-native-paper-dropdown";
import { ToggleableTextInput } from "./ToggleableTextInput";

interface OptionPickerProps {
  label: string;
  value: string;
  items: string[];
  enabled?: boolean;
  setValue: (value: string) => void;
}

const OptionPicker: React.FC<OptionPickerProps> = ({
  label,
  value,
  items,
  enabled = true,
  setValue,
}) => {
  return (
    <View>
      {enabled ? (
        <Dropdown
          label={label}
          value={value}
          onSelect={(selectedValue) => {
            if (selectedValue !== undefined) {
              setValue(selectedValue);
            }
          }}
          options={items.map((v) => ({ label: v, value: v }))}
        />
      ) : (
        <ToggleableTextInput
          label={label}
          placeholder={label}
          value={value}
          editable={false}
          onChange={setValue}
        />
      )}
    </View>
  );
};

export default OptionPicker;
