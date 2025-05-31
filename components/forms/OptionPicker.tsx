import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Menu, IconButton } from "react-native-paper";
import { TextInput } from "react-native-paper";
import { BiMap } from "@/utils/bimap";

interface OptionPickerProps {
  label: string;
  value: string;
  items: BiMap;
  editable?: boolean;
  setValue: (value: string) => void;
  style?: "default" | "white";
}

const OptionPicker: React.FC<OptionPickerProps> = ({
  label,
  value,
  items,
  editable = true,
  setValue,
  style = "default",
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
                <TextInput
                  label={label}
                  value={items.getFrontValue(value) || ""}
                  editable={false}
                  pointerEvents="none"
                  style={{
                    backgroundColor: style === "white" ? "#fff" : undefined,
                  }}
                />
              </Pressable>
              <IconButton
                icon="close"
                size={20}
                mode="contained"
                onPress={() => {
                  setValue("");
                  setMenuVisible(false);
                }}
                style={{
                  backgroundColor: style === "white" ? "#fff" : undefined,
                }}
              />
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
        <TextInput
          label={label}
          value={items.getFrontValue(value) || ""}
          editable={false}
          pointerEvents="none"
          style={{ backgroundColor: style === "white" ? "#fff" : undefined }}
        />
      )}
    </View>
  );
};

export default OptionPicker;
