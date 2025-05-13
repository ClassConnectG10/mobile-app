import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { TextField } from "./TextField";

interface OptionPickerProps {
  label: string;
  value: string;
  items: readonly string[];
  editable?: boolean;
  setValue: (value: string) => void;
}

const OptionPicker: React.FC<OptionPickerProps> = ({
  label,
  value,
  items,
  editable = true,
  setValue,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View>
      {editable ? (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setMenuVisible(true)}
              >
                <TextField label={label} value={value} />
              </Pressable>
              <IconButton
                icon="close"
                size={20}
                mode="contained"
                onPress={() => {
                  setValue("");
                  setMenuVisible(false);
                }}
              />
            </View>
          }
        >
          {items.map((item) => (
            <Menu.Item
              key={item}
              onPress={() => {
                setValue(item);
                setMenuVisible(false);
              }}
              title={item}
            />
          ))}
        </Menu>
      ) : (
        <TextField label={label} value={value} />
      )}
    </View>
  );
};

export default OptionPicker;
