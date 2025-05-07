import { StyleSheet, View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface OptionPickerProps {
  label: string;
  value: string;
  items: string[];
  setValue: (value: string) => void;
}

const OptionPicker: React.FC<OptionPickerProps> = ({
  label,
  value,
  items,
  setValue,
}) => {
  return (
    <View>
      <Text style={styles.label}>{label}:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={value}
          onValueChange={(v, _) => setValue(v)}
          style={styles.picker}
        >
          {items.map((v, i) => (
            <Picker.Item key={i} label={v} value={v} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  picker: {
    height: 55,
    width: "100%",
  },
});

export default OptionPicker;
