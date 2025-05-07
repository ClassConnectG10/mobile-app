import { useState } from "react";
import { Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

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
      <Button mode="contained" onPress={() => setVisible(true)}>
        {label}: {value.toLocaleDateString()}
      </Button>

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
