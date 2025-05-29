import { TextInput } from "react-native-paper";

interface ToggleableTextInputProps {
  label: string;
  placeholder: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
}

export const ToggleableTextInput: React.FC<ToggleableTextInputProps> = ({
  label,
  placeholder,
  value,
  editable,
  onChange,
}) => {
  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      editable={editable}
      onChangeText={onChange}
      value={value}
      right={
        editable ? (
          <TextInput.Icon icon="close" onPress={() => onChange("")} />
        ) : undefined
      }
      multiline={true}
    ></TextInput>
  );
};
