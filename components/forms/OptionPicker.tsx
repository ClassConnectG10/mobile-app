import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { TextField } from "./TextField";

import { BiMap } from "@/utils/bimap";

interface OptionPickerProps {
  label: string;
  value: string;
  items: BiMap;
  editable?: boolean;
  setValue: (value: string) => void;
  style?: "default" | "white";
  canReset?: boolean;
}

const OptionPicker: React.FC<OptionPickerProps> = ({
  label,
  value,
  items,
  editable = true,
  setValue,
  style = "default",
  canReset = true,
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
                <TextField
                  label={label}
                  value={items.getFrontValue(value) || ""}
                  style={style}
                />
              </Pressable>
              {canReset &&
                (style === "default" ? (
                  <IconButton
                    icon="close"
                    size={20}
                    mode="contained"
                    onPress={() => {
                      setValue("");
                      setMenuVisible(false);
                    }}
                  />
                ) : (
                  <IconButton
                    icon="close"
                    size={20}
                    mode="contained"
                    onPress={() => {
                      setValue("");
                      setMenuVisible(false);
                    }}
                    style={{
                      backgroundColor: "#fff",
                    }}
                  />
                ))}
            </View>
          }
        >
          {[...items.values()].map(({ front, back }) => (
            <Menu.Item
              key={back}
              onPress={() => {
                setValue(back);
                setMenuVisible(false);
              }}
              title={front}
            />
          ))}
        </Menu>
      ) : (
        <TextField
          label={label}
          value={items.getFrontValue(value) || ""}
          style={style}
        />
      )}
    </View>
  );
};

export default OptionPicker;
