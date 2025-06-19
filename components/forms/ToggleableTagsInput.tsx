import React, { useState } from "react";
import { View, TextInput } from "react-native";
import { Chip, Icon, IconButton, Text, useTheme } from "react-native-paper";
import { ToggleableTextInput } from "./ToggleableTextInput";

interface ToggleableTagsInputProps {
  tags: string[];
  editable?: boolean;
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export const ToggleableTagsInput: React.FC<ToggleableTagsInputProps> = ({
  tags,
  editable = true,
  onChange,
  maxTags = Infinity,
}) => {
  const theme = useTheme();
  const [newTag, setNewTag] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setNewTag("");
      setIsInputVisible(false);
    }
  };

  const handleDiscardChanges = () => {
    setNewTag("");
    setIsInputVisible(false);
  };

  const handleDeleteTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    onChange(updatedTags);
  };

  const isDisabled = (text: string) => {
    const trimmedText = text.trim();
    const lowerCaseText = trimmedText.toLowerCase();
    const lowerCaseTags = tags.map((tag) => tag.toLowerCase());

    return (
      !trimmedText ||
      lowerCaseTags.includes(lowerCaseText) ||
      tags.length >= maxTags
    );
  };

  return (
    <View style={{ gap: 8 }}>
      {/* <Text variant="titleMedium">Tags</Text> */}
      <View style={{ flexWrap: "wrap", flexDirection: "row", gap: 8 }}>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            onClose={editable ? () => handleDeleteTag(index) : undefined}
          >
            {tag}
          </Chip>
        ))}
        {editable && !isInputVisible && tags.length < maxTags && (
          <Chip
            onPress={() => setIsInputVisible(true)}
            onClose={() => setNewTag("")}
            closeIcon={() => (
              <Icon source="plus" color={theme.colors.onPrimary} size={18} />
            )}
            textStyle={{ color: theme.colors.onPrimary }}
            style={{
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.onPrimary,
            }}
          >
            Añadir tag
          </Chip>
        )}
      </View>
      {isInputVisible && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <ToggleableTextInput
              label={"Tag"}
              placeholder="Añadir tag"
              value={newTag}
              onChange={setNewTag}
              autoFocus
              editable={true}
              clearable={false}
            />
          </View>
          <IconButton
            mode="contained"
            icon="close"
            onPress={handleDiscardChanges}
            // disabled={isDisabled(newTag)}
          />
          <IconButton
            mode="contained"
            icon="check"
            onPress={handleAddTag}
            disabled={isDisabled(newTag)}
          />
        </View>
      )}
    </View>
  );
};
