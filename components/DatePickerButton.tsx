import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TextInput } from "react-native-paper";
import { Pressable } from "react-native";

type DatePickerProps = {
  label: string;
  value: Date | null;
  editable?: boolean;
  type?: "date" | "time" | "datetime";
  onChange: (date: Date) => void;
};

export const DatePickerButton: React.FC<DatePickerProps> = ({
  label,
  value,
  editable = true,
  type = "date",
  onChange,
}) => {
  const [showPicker, setShowPicker] = useState<"date" | "time" | null>(null);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(null);
    if (!selectedDate) return;

    let updated = new Date(value || Date.now());

    if (type === "date") {
      updated.setFullYear(selectedDate.getFullYear());
      updated.setMonth(selectedDate.getMonth());
      updated.setDate(selectedDate.getDate());
      onChange(updated);
    } else if (type === "datetime") {
      updated.setFullYear(selectedDate.getFullYear());
      updated.setMonth(selectedDate.getMonth());
      updated.setDate(selectedDate.getDate());
      onChange(updated);
      setShowPicker("time");
    }
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    setShowPicker(null);
    if (!selectedTime) return;

    let updated = new Date(value || Date.now());
    updated.setHours(selectedTime.getHours());
    updated.setMinutes(selectedTime.getMinutes());
    updated.setSeconds(0);
    onChange(updated);
  };

  const formatValue = () => {
    if (!value) return "";

    switch (type) {
      case "date":
        return value.toLocaleDateString();
      case "time":
        return value.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "datetime":
        return (
          value.toLocaleDateString() +
          " " +
          value.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          })
        );
      default:
        return "";
    }
  };

  return (
    <>
      <Pressable
        style={{ flex: 1 }}
        onPress={() =>
          editable && setShowPicker(type === "time" ? "time" : "date")
        }
      >
        <TextInput
          label={label}
          value={formatValue()}
          editable={false}
          pointerEvents="none"
        />
      </Pressable>

      {showPicker === "date" && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {showPicker === "time" && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          display="default"
          is24Hour={true}
          onChange={handleTimeChange}
        />
      )}
    </>
  );
};
