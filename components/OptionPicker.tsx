import { View } from "react-native";
import { Dropdown } from "react-native-paper-dropdown";
import { ToggleableTextInput } from "./ToggleableTextInput";
import { TextInput } from "react-native-paper";

interface OptionPickerProps {
  label: string;
  value: string;
  items: readonly string[];
  editable?: boolean;
  setValue: (value: string) => void;
}

const OptionPicker: React.FC<OptionPickerProps> = ({
  label,
  value,
  items,
  editable = true,
  setValue,
}) => {
  return (
    <View>
      {editable ? (
        <Dropdown
          label={label}
          placeholder="Select an option"
          value={value}
          onSelect={(selectedValue) => {
            setValue(selectedValue ?? "");
          }}
          options={items.map((v) => ({ label: v, value: v }))}
        />
      ) : (
        <TextInput
          label={label}
          placeholder={label}
          value={value}
          editable={false}
          onChangeText={setValue}
        />
      )}
    </View>
  );
};

export default OptionPicker;
