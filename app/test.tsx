import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Appbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { File } from "@/types/file";
import { Link } from "@/types/link";
import { ToggleableFileInput } from "@/components/forms/ToggleableFileInput";
import { ToggleableLinkInput } from "@/components/forms/ToggleableLinkInput";

export default function TestPage() {
  const router = useRouter();
  const [files, setFiles] = useState([
    new File(
      "1.pdf",
      "application/pdf",
      null,
      "/course/16b8c2e6-3239-4f18-9165-364d713fadbe/1",
    ),
  ]);
  const [links, setLinks] = useState([
    new Link("Google", "https://www.google.com"),
  ]);

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => router.back()} />
        <Appbar.Content title="Testing file structure" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ flex: 1, padding: 16, gap: 16 }}>
        <ToggleableFileInput
          files={files}
          editable={true}
          onChange={setFiles}
          maxFiles={5}
        />
        <ToggleableLinkInput
          links={links}
          editable={true}
          onChange={setLinks}
          maxLinks={5}
        />
        <ToggleableLinkInput
          links={links}
          editable={false}
          onChange={setLinks}
          maxLinks={5}
        />
      </ScrollView>
    </>
  );
}
