import { View } from "react-native";
import { IconButton, TextInput, Text } from "react-native-paper";

interface ToggleableNumberInputsProps {
  label: string;
  value: number;
  editable?: boolean;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
}

export const ToggleableNumberInput: React.FC<ToggleableNumberInputsProps> = ({
  label,
  value,
  editable = true,
  onChange,
  minValue = 1,
  maxValue,
}) => {
  const decreaseNumStudents = () => {
    if (!minValue || value >= minValue) {
      onChange(value - 1);
    }
  };

  const increaseNumStudents = () => {
    if (!maxValue || value < maxValue) {
      onChange(value + 1);
    }
  };

  return editable ? (
    <>
      <Text variant="titleMedium">{label}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          // flex: 1,
          gap: 10,
          justifyContent: "center",
        }}
      >
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
