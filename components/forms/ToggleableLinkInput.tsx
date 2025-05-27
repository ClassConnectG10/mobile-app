import { Link } from "@/types/link";
import React, { useState } from "react";
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
  const [editingValue, setEditingValue] = useState<Link | null>(null);
  const [showUrlIndex, setShowUrlIndex] = useState<number | null>(null);

  // Agregar un nuevo link vacío y ponerlo en modo edición
  const handleAdd = () => {
    if (editingIndex !== null) return;
    setEditingIndex(links.length);
    setEditingValue({ display: "", url: "" });
    onChange([...links, { display: "", url: "" }]);
  };

  // Confirmar edición/agregado
  const handleConfirm = () => {
    if (!editingValue?.display || !editingValue?.url) return;
    const updated = [...links];
    updated[editingIndex!] = editingValue;
    onChange(updated);
    setEditingIndex(null);
    setEditingValue(null);
  };

  // Cancelar edición/agregado
  const handleCancel = () => {
    // Si es un nuevo link, lo eliminamos
    if (
      editingIndex === links.length - 1 &&
      !links[editingIndex!].display &&
      !links[editingIndex!].url
    ) {
      const updated = links.slice(0, -1);
      onChange(updated);
    }
    setEditingIndex(null);
    setEditingValue(null);
  };

  // Iniciar edición de un link existente
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue({ ...links[index] });
  };

  // Eliminar link
  const handleDelete = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    onChange(updated);
    // Si se borra el que se está editando, salir de edición
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue(null);
    }
  };

  const handleLinkPress = async (index: number) => {
    const url = links[index]?.url;
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error(`Error al abrir la URL: ${url}`, error);
    }
  };

  // Elimina link vacío sin confirmar antes de editar otro
  function removePendingEmptyLink(
    editingIndex: number | null,
    links: Link[],
    onChange: (links: Link[]) => void,
    setEditingIndex: (v: number | null) => void,
    setEditingValue: (v: Link | null) => void,
  ) {
    if (
      editingIndex === links.length - 1 &&
      !links[editingIndex!].display &&
      !links[editingIndex!].url
    ) {
      const updated = links.slice(0, -1);
      onChange(updated);
      setEditingIndex(null);
      setEditingValue(null);
    }
  }

  return (
    <View style={{ gap: 4 }}>
      {links.length === 0 && (
        <Text style={{ textAlign: "center" }}>No hay links</Text>
      )}
      {links.map((link, index) => (
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
            onPress={() => {
              handleLinkPress(index);
            }}
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
                    value={editingValue?.display ?? ""}
                    onChangeText={(t) =>
                      setEditingValue((v) => ({ ...v!, display: t }))
                    }
                    dense
                    autoFocus
                    right={
                      editingValue?.display ? (
                        <TextInput.Icon
                          icon="close"
                          onPress={() =>
                            setEditingValue((v) => ({ ...v!, display: "" }))
                          }
                        />
                      ) : null
                    }
                  />
                  <TextInput
                    label="URL"
                    value={editingValue?.url ?? ""}
                    onChangeText={(t) =>
                      setEditingValue((v) => ({ ...v!, url: t }))
                    }
                    multiline={true}
                    dense
                    right={
                      editingValue?.url ? (
                        <TextInput.Icon
                          icon="close"
                          onPress={() =>
                            setEditingValue((v) => ({ ...v!, url: "" }))
                          }
                        />
                      ) : null
                    }
                  />
                </>
              ) : (
                <View
                  style={{
                    justifyContent: "center",
                    flexGrow: 1,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>{link.display}</Text>
                  {showUrlIndex === index && (
                    <Text
                      style={{ color: theme.colors.secondary, fontSize: 13 }}
                    >
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
                  size={22}
                  onPress={handleConfirm}
                  disabled={!editingValue?.display || !editingValue?.url}
                  style={{ margin: 0 }}
                />
                <IconButton
                  icon="close"
                  size={22}
                  onPress={handleCancel}
                  style={{ margin: 0 }}
                />
              </View>
            ) : editable ? (
              <>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => {
                    removePendingEmptyLink(
                      editingIndex,
                      links,
                      onChange,
                      setEditingIndex,
                      setEditingValue,
                    );
                    handleEdit(index);
                  }}
                  style={{ margin: 0 }}
                />
                <IconButton
                  icon="trash-can"
                  size={20}
                  onPress={() => handleDelete(index)}
                  style={{ margin: 0 }}
                />
              </>
            ) : (
              <IconButton
                icon={showUrlIndex === index ? "eye-off" : "eye"}
                size={20}
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
        links.length < (maxLinks || Infinity) &&
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
