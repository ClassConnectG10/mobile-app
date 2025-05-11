import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TextInput } from "react-native-paper";
import { Pressable } from "react-native";

type DatePickerProps = {
  label: string;
  value: Date | null;
  editable?: boolean;
  onChange: (date: Date) => void;
};

export const DatePickerButton: React.FC<DatePickerProps> = ({
  label,
  value,
  editable = true,
  onChange,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => {
          if (editable) {
            setVisible(true);
          }
        }}
        style={{ flex: 1 }}
      >
        <TextInput
          label={label}
          value={value ? value.toLocaleDateString() : ""}
          editable={false}
        />
      </Pressable>

      {visible && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            const newDate = selectedDate || value;
            setVisible(false);
            onChange(newDate ?? new Date());
          }}
        />
      )}
    </>
  );
};
