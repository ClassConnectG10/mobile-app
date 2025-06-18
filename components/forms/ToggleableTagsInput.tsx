import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { Card, IconButton } from "react-native-paper";

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
  maxTags,
}) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setNewTag("");
    }
  };

  const handleDeleteTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    onChange(updatedTags);
  };

  return (
    <View style={{ gap: 4 }}>
      {tags.length === 0 && (
        <Text style={{ textAlign: "center" }}>No hay tags</Text>
      )}
      {tags.map((tag, index) => (
        <Card
          key={index}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 8,
            elevation: 1,
            justifyContent: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ flex: 1, fontWeight: "bold" }}>{tag}</Text>
            {editable && (
              <IconButton
                icon="trash-can"
                size={24}
                onPress={() => handleDeleteTag(index)}
                style={{ margin: 0 }}
              />
            )}
          </View>
        </Card>
      ))}
      {editable && tags.length < (maxTags || Infinity) && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TextInput
            style={{ flex: 1 }}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Agregar tag"
          />
          <Button title="Agregar" onPress={handleAddTag} />
        </View>
      )}
    </View>
  );
};
