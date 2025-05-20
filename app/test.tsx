import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Appbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";

export default function TestPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => router.back()} />
        <Appbar.Content title="Testing file structure" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ flex: 1, padding: 16 }}>
        <ToggleableFileInput
          files={files}
          editable={true}
          onChange={setFiles}
          maxFiles={5}
        />
      </ScrollView>
    </>
  );
}
