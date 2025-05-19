import { getCourseModules } from "@/services/courseManagement";
import { Course, CourseModule } from "@/types/course";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import {
  useTheme,
  Text,
  ActivityIndicator,
  Button,
  IconButton,
  FAB,
} from "react-native-paper";
import ErrorMessageSnackbar from "../../ErrorMessageSnackbar";
import ModuleCard from "../../cards/ModuleCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";

interface ModulesTabProps {
  course: Course;
}

export const ModulesTab: React.FC<ModulesTabProps> = ({ course }) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [modules, setModules] = useState<CourseModule[]>([]);

  async function fetchModules() {
    if (!course.courseId) return;

    setIsLoading(true);
    try {
      const modules = await getCourseModules(course.courseId);
      setModules(modules);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchModules();
  }, [course.courseId]);

  const handleCreateModule = () => {
    router.push({
      pathname: "/courses/[courseId]/teacher/modules/create",
      params: { courseId: course.courseId },
    });
  };

  return (
    <View style={{ paddingHorizontal: 16, flex: 1 }}>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
        </View>
      ) : (
        <View
          style={{
            gap: 16,
          }}
        >
          <FlatList
            data={modules}
            keyExtractor={(item) => item.moduleId.toString()}
            renderItem={({ item, index }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ModuleCard module={item} onPress={() => {}} />

                <View>
                  {index > 0 && (
                    <IconButton icon="arrow-up" size={18} onPress={() => {}} />
                  )}
                  {index < modules.length - 1 && (
                    <IconButton
                      icon="arrow-down"
                      size={18}
                      onPress={() => {}}
                    />
                  )}
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text variant="titleMedium">No hay módulos</Text>
              </View>
            }
          />
        </View>
      )}
      <FloatingActionButton onPress={handleCreateModule} />

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
