import { View } from "react-native";
import { IconButton, TextInput, Text } from "react-native-paper";
import { TextField } from "./TextField";

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
        <TextInput
          label={label}
          value={value.toString()}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (!isNaN(num)) {
              onChange(num);
            }
          }}
          keyboardType="numeric"
          style={{ textAlign: "center", flex: 1 }}
        />
        {/* <Text variant="titleLarge">{value}</Text> */}

        <IconButton
          icon="plus"
          mode="contained"
          onPress={() => increaseNumStudents()}
        />
      </View>
    </>
  ) : (
    <TextField label={label} value={value.toString()} />
  );
};
