import { View, FlatList, StyleSheet } from "react-native";
import {
  Appbar,
  Button,
  Text,
  Searchbar,
  Modal,
  Divider,
  IconButton,
  useTheme,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import OptionPicker from "@/components/OptionPicker";
import {
  levels,
  modalities,
  categories,
} from "@/utils/constants/courseDetails";
import { globalStyles } from "@/styles/globalStyles";
import { DatePickerButton } from "@/components/DatePickerButton";
import { useState } from "react";
import Course from "@/types/course";
import { searchCourses } from "@/services/courseManagement";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import CourseCard from "@/components/CourseCard";
import { SearchOption } from "@/types/searchOption";
import { useSearchFilters } from "@/hooks/useSearchFilters";

export default function SearchCoursesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchFiltersModalVisible, setSearchFiltersModalVisible] =
    useState(false);

  const searchFiltersHook = useSearchFilters();
  const searchFilters = searchFiltersHook.searchFilters;

  const fetchCourses = async () => {
    try {
      const coursesData = await searchCourses(
        searchFilters,
        SearchOption.NOT_RELATED
      );
      setCourses(coursesData);
    } catch (error) {
      setErrorMessage(`Error al buscar cursos: ${error}`);
    }
  };

  const handleSelectCourse = (course: Course) => {
    router.push({
      pathname: "/courses/[courseId]/inscription",
      params: { courseId: course.courseId },
    });
  };

  const handleApplyFilters = async () => {
    setSearchFiltersModalVisible(false);
    fetchCourses();
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Buscar cursos" />
        <Appbar.Action
          icon="filter"
          onPress={() => {
            setSearchFiltersModalVisible(true);
          }}
        />
      </Appbar.Header>

      <View style={[globalStyles.mainContainer, styles.mainContainer]}>
        <Searchbar
          placeholder="Buscar cursos"
          onChangeText={searchFiltersHook.setSearchQuery}
          value={searchFilters.searchQuery}
          onIconPress={fetchCourses}
        />

        <View style={{ marginVertical: 16 }}>
          <FlatList
            data={courses}
            keyExtractor={(item) => item.courseId.toString()}
            renderItem={({ item }) => (
              <CourseCard
                name={item.courseDetails.title}
                description={item.courseDetails.description}
                category={item.courseDetails.category}
                onPress={() => handleSelectCourse(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
        </View>

        <Modal
          visible={searchFiltersModalVisible}
          onDismiss={() => {
            setSearchFiltersModalVisible(false);
          }}
          contentContainerStyle={styles.modalContainer}
          style={styles.modalContent}
        >
          <Text variant="titleLarge">Filtros de búsqueda</Text>

          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <DatePickerButton
              label="Fecha de inicio"
              value={searchFilters.startDate}
              onChange={searchFiltersHook.setStartDate}
            />
            <IconButton
              icon="reload"
              mode="contained"
              iconColor={theme.colors.primary}
              size={20}
              onPress={() => {
                searchFiltersHook.setStartDate(null);
              }}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <DatePickerButton
              label="Fecha de finalización"
              value={searchFilters.endDate}
              onChange={searchFiltersHook.setEndDate}
            />
            <IconButton
              icon="reload"
              mode="contained"
              iconColor={theme.colors.primary}
              size={20}
              onPress={() => {
                searchFiltersHook.setEndDate(null);
              }}
            />
          </View>

          <OptionPicker
            label="Nivel"
            value={searchFilters.level}
            items={levels}
            setValue={searchFiltersHook.setLevel}
          />
          <OptionPicker
            label="Categoría"
            value={searchFilters.category}
            items={categories}
            setValue={searchFiltersHook.setCategory}
          />

          <OptionPicker
            label="Modalidad"
            value={searchFilters.modality}
            items={modalities}
            setValue={searchFiltersHook.setModality}
          />

          <Divider />
          <View style={{ flexDirection: "row", gap: 20 }}>
            <Button
              mode="contained"
              icon="filter-remove"
              onPress={searchFiltersHook.resetSearchFilters}
            >
              Borrar filtros
            </Button>
            <Button
              mode="contained"
              icon="filter-check"
              onPress={handleApplyFilters}
            >
              Guardar filtros
            </Button>
          </View>
        </Modal>

        <ErrorMessageSnackbar
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingBottom: 100,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    elevation: 5,
    gap: 16,
  },
  modalContent: {
    gap: 16,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#6200ee",
    borderRadius: 4,
    padding: 10,
    color: "white",
  },
});
