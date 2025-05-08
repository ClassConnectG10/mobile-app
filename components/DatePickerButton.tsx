import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Pressable } from "react-native";

type DatePickerProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

export const DatePickerButton: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={{ flex: 1 }}>
        <TextInput
          label={label}
          value={value.toLocaleDateString()}
          onFocus={() => setVisible(true)}
          editable={false}
        />
      </Pressable>

      {visible && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            const newDate = selectedDate || value;
            setVisible(false);
            onChange(newDate);
          }}
        />
      )}
    </>
  );
};
