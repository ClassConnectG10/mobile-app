import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { pick } from "@react-native-documents/picker";
import { viewDocument } from "@react-native-documents/viewer";

export default function TestPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);

  const handlePickDocument = async () => {
    try {
      const results = await pick();
      if (results && results.length > 0) {
        setFiles((prev) => [...prev, ...results]);
      }
      console.log("Documentos seleccionados:", results);
    } catch (err) {
      console.error("Error al seleccionar documento:", err);
    }
  };

  const handleViewDocument = async (file: any) => {
    try {
      await viewDocument({ uri: file.uri, mimeType: file.type });
    } catch (err) {
      console.error("Error al abrir documento:", err);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => router.back()} />
        <Appbar.Content title="Testing file structure" />
      </Appbar.Header>

      <View style={styles.container}>
        <Button mode="contained" onPress={handlePickDocument}>
          Seleccionar archivo
        </Button>

        {files.length === 0 ? (
          <Text style={{ marginTop: 20 }}>
            No hay archivos seleccionados aún.
          </Text>
        ) : (
          <ScrollView style={styles.fileList}>
            {files.map((file, index) => (
              <Card key={file.uri.concat(index.toString())} style={styles.card}>
                <Card.Title title={file.name || "Documento"} />
                <Card.Actions>
                  <Button onPress={() => handleViewDocument(file)}>Ver</Button>
                  <Button
                    onPress={() => handleRemoveFile(index)}
                    textColor="white"
                  >
                    Eliminar
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  fileList: {
    alignSelf: "stretch",
    marginTop: 20,
  },
  card: {
    marginBottom: 12,
    marginHorizontal: 10,
  },
});
