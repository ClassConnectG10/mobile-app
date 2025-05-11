import { View } from "react-native";
import { IconButton, TextInput, Text } from "react-native-paper";

interface ToggleableNumberInputsProps {
  label: string;
  value: number;
  editable?: boolean;
  onChange: (value: number) => void;
}

export const ToggleableNumberInput: React.FC<ToggleableNumberInputsProps> = ({
  label,
  value,
  editable = true,
  onChange,
}) => {
  const decreaseNumStudents = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const increaseNumStudents = () => {
    onChange(value + 1);
  };

  return editable ? (
    <>
      <Text variant="titleMedium">{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <IconButton
          icon="minus"
          mode="contained"
          onPress={() => decreaseNumStudents()}
        />

        <Text variant="titleLarge">{value}</Text>
        <IconButton
          icon="plus"
          mode="contained"
          onPress={() => increaseNumStudents()}
        />
      </View>
    </>
  ) : (
    <TextInput
      label={label}
      editable={false}
      value={value.toString()}
    ></TextInput>
  );
};
