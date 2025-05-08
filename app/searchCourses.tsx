import { View, ScrollView } from "react-native";
import { Appbar, Button, Text, TextInput, Searchbar } from "react-native-paper";
import { useRouter } from "expo-router";
import OptionPicker from "@/components/OptionPicker";
import {
  levels,
  modalities,
  categories,
} from "@/utils/constants/courseDetails";
import { useCourseDetails } from "@/hooks/useCourseDetails";
import { globalStyles } from "@/styles/globalStyles";
import { DatePickerButton } from "@/components/DatePickerButton";
import { useState } from "react";

export default function SearchCoursesPage() {
  const router = useRouter();
  const [courseSearchQuery, setCourseSearchQuery] = useState("");

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Buscar cursos" />
      </Appbar.Header>
      <View style={globalStyles.mainContainer}>
        <Searchbar
          placeholder="Buscar cursos"
          onChangeText={setCourseSearchQuery}
          value={courseSearchQuery}
        />
        <ScrollView
          contentContainerStyle={globalStyles.courseDetailsContainer}
        ></ScrollView>
      </View>
    </>
  );
}
