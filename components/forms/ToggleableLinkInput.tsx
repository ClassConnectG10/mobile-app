import { Link } from "@/types/link";
import React, { useState, useEffect } from "react";
import { View, Pressable, Linking } from "react-native";
import {
  Button,
  Card,
  IconButton,
  Text,
  TextInput,
  useTheme,
  Icon,
} from "react-native-paper";

interface ToggleableLinkInputProps {
  links: Link[];
  editable?: boolean;
  onChange: (links: Link[]) => void;
  maxLinks?: number;
}

export const ToggleableLinkInput: React.FC<ToggleableLinkInputProps> = ({
  links,
  editable = true,
  onChange,
  maxLinks,
}) => {
  const theme = useTheme();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showUrlIndex, setShowUrlIndex] = useState<number | null>(null);
  const [tempLinks, setTempLinks] = useState<Link[]>(links);

  useEffect(() => {
    setTempLinks(links);
  }, [links]);

  const handleAdd = () => {
    if (editingIndex !== null) return;
    setTempLinks([...links, { display: "", url: "" }]);
    setEditingIndex(links.length);
  };

  const handleConfirm = () => {
    const editing = tempLinks[editingIndex!];
    if (!editing.display || !editing.url) return;
    setEditingIndex(null);
    onChange(tempLinks);
  };

  const handleCancel = () => {
    setTempLinks(links);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    const updated = tempLinks.filter((_, i) => i !== index);
    setTempLinks(updated);
    onChange(updated);
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleLinkPress = async (index: number) => {
    const url = tempLinks[index]?.url;
    if (!url) return;
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        await Linking.openURL(url);
      } else {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else console.warn(`No se puede abrir la URL: ${url}`);
      }
    } catch (error) {
      console.error(`Error al abrir la URL: ${url}`, error);
    }
  };

  // Para actualizar el campo en edición
  const updateEditingField = (field: keyof Link, value: string) => {
    setTempLinks((prev) =>
      prev.map((l, i) =>
        i === editingIndex ? { ...l, [field]: value } : l
      )
    );
  };

  return (
    <View style={{ gap: 4 }}>
      {tempLinks.length === 0 && (
        <Text style={{ textAlign: "center" }}>No hay links</Text>
      )}
      {tempLinks.map((link, index) => (
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
          <Pressable
            disabled={editable && editingIndex === index}
            onPress={() => handleLinkPress(index)}
            style={{ flexDirection: "row", gap: 10, paddingVertical: 4 }}
          >
            <View style={{ justifyContent: "center" }}>
              <Icon
                source="link-variant"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              {editable && editingIndex === index ? (
                <>
                  <TextInput
                    label="Texto a mostrar"
                    value={tempLinks[editingIndex]?.display ?? ""}
                    onChangeText={(t) => updateEditingField("display", t)}
                    dense
                    autoFocus
                    right={
                      tempLinks[editingIndex]?.display ? (
                        <TextInput.Icon
                          icon="close"
                          onPress={() => updateEditingField("display", "")}
                        />
                      ) : null
                    }
                  />
                  <TextInput
                    label="URL"
                    value={tempLinks[editingIndex]?.url ?? ""}
                    onChangeText={(t) => updateEditingField("url", t)}
                    multiline
                    dense
                    right={
                      tempLinks[editingIndex]?.url ? (
                        <TextInput.Icon
                          icon="close"
                          onPress={() => updateEditingField("url", "")}
                        />
                      ) : null
                    }
                  />
                </>
              ) : (
                <View style={{ justifyContent: "center", flexGrow: 1 }}>
                  <Text style={{ fontWeight: "bold" }}>{link.display}</Text>
                  {showUrlIndex === index && (
                    <Text style={{ color: theme.colors.secondary, fontSize: 13 }}>
                      {link.url}
                    </Text>
                  )}
                </View>
              )}
            </View>
            {editable && editingIndex === index ? (
              <View
                style={{
                  flexDirection: "column",
                  gap: 2,
                  justifyContent: "space-around",
                }}
              >
                <IconButton
                  icon="check"
                  size={24}
                  onPress={handleConfirm}
                  disabled={
                    !tempLinks[editingIndex]?.display ||
                    !tempLinks[editingIndex]?.url
                  }
                  style={{ margin: 0 }}
                />
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleCancel}
                  style={{ margin: 0 }}
                />
              </View>
            ) : editable ? (
              <View style={{ flexDirection: "row", gap: 2 }}>
                <IconButton
                  icon="pencil"
                  size={24}
                  onPress={() => handleEdit(index)}
                  style={{ margin: 0 }}
                />
                <IconButton
                  icon="trash-can"
                  size={24}
                  onPress={() => handleDelete(index)}
                  style={{ margin: 0 }}
                />
              </View>
            ) : (
              <IconButton
                icon={showUrlIndex === index ? "eye-off" : "eye"}
                size={24}
                onPress={() =>
                  setShowUrlIndex(showUrlIndex === index ? null : index)
                }
                style={{ margin: 0 }}
              />
            )}
          </Pressable>
        </Card>
      ))}
      {editable &&
        tempLinks.length < (maxLinks || Infinity) &&
        editingIndex === null && (
          <Button
            icon="plus"
            mode="contained"
            onPress={handleAdd}
            style={{ marginTop: 10 }}
            contentStyle={{ height: 44 }}
          >
            Agregar link
          </Button>
        )}
    </View>
  );
};
