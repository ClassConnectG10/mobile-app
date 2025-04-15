import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import countries from "./countries";

const DEFAULT_SELECTED_COUNTRY: string = "Argentina";

interface CountryPickerProps {
  onCountrySelect: (country: string) => void;
}

/**
 *  Dropdown menu to select user's country on registration
 */
const CountryPicker: React.FC<CountryPickerProps> = ({ onCountrySelect }) => {
  const [selectedCountry, setSelectedCountry] = useState(
    DEFAULT_SELECTED_COUNTRY
  );

  const handleValueChange = (itemValue: string, itemIndex: number) => {
    setSelectedCountry(itemValue);
    onCountrySelect(itemValue);
  };

  return (
    <View>
      <Text style={styles.label}>País de residencia:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCountry}
          onValueChange={handleValueChange}
          style={styles.picker}
        >
          {countries.map((country, index) => (
            <Picker.Item key={index} label={country} value={country} />
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

export default CountryPicker;
