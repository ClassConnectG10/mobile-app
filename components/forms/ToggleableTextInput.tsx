import { TextInput } from "react-native-paper";

interface ToggleableTextInputProps {
  label: string;
  placeholder: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  clearable?: boolean;
}

export const ToggleableTextInput: React.FC<ToggleableTextInputProps> = ({
  label,
  placeholder,
  value,
  editable,
  onChange,
  autoFocus = false,
  clearable = true,
}) => {
  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      editable={editable}
      onChangeText={onChange}
      value={value}
      right={
        editable && clearable && value ? (
          <TextInput.Icon icon="close" onPress={() => onChange("")} />
        ) : undefined
      }
      multiline={true}
      autoFocus={autoFocus}
    ></TextInput>
  );
};
