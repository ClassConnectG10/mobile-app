import { getModules } from "@/services/resourceManager";
import { Course } from "@/types/course";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { FlatList, View } from "react-native";
import {
  useTheme,
  Text,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import ErrorMessageSnackbar from "../../ErrorMessageSnackbar";
import ModuleCard from "../../cards/ModuleCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Module } from "@/types/resources";

interface ModulesTabProps {
  course: Course;
}

export const ModulesTab: React.FC<ModulesTabProps> = ({ course }) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [modules, setModules] = useState<Module[]>([]);

  async function fetchModules() {
    if (!course.courseId) return;

    setIsLoading(true);
    try {
      const modules = await getModules(course.courseId);
      setModules(modules);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchModules();
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchModules();
    }, [course.courseId]),
  );

  const handleEditModulesOrder = () => {
    setIsEditing(!isEditing);
  };

  const handleCreateModule = () => {
    router.push({
      pathname: "/courses/[courseId]/teacher/modules/create",
      params: { courseId: course.courseId },
    });
  };

  const handleMoveUpModule = (index: number) => {
    const newModules = [...modules];
    const temp = newModules[index - 1];
    newModules[index - 1] = newModules[index];
    newModules[index] = temp;
    setModules(newModules);
  };

  const handleMoveDownModule = (index: number) => {
    const newModules = [...modules];
    const temp = newModules[index + 1];
    newModules[index + 1] = newModules[index];
    newModules[index] = temp;
    setModules(newModules);
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
            gap: 32,
          }}
        >
          <FlatList
            data={modules}
            keyExtractor={(item) => item.moduleId.toString()}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            renderItem={({ item, index }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ModuleCard
                  module={item}
                  onPress={() => {
                    router.push({
                      pathname:
                        "/courses/[courseId]/teacher/modules/[moduleId]",
                      params: {
                        courseId: course.courseId,
                        moduleId: item.moduleId,
                        userRole: course.currentUserRole,
                      },
                    });
                  }}
                />

                {isEditing && (
                  <View
                    style={{
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    {index > 0 && (
                      <IconButton
                        mode="contained"
                        style={{
                          margin: 0,
                        }}
                        icon="arrow-up"
                        size={16}
                        onPress={() => {
                          handleMoveUpModule(index);
                        }}
                      />
                    )}
                    {index < modules.length - 1 && (
                      <IconButton
                        mode="contained"
                        style={{
                          margin: 0,
                        }}
                        icon="arrow-down"
                        size={16}
                        onPress={() => {
                          handleMoveDownModule(index);
                        }}
                      />
                    )}
                  </View>
                )}
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
      <FloatingActionButton
        onPress={
          isEditing
            ? () => {
                setIsEditing(false);
              }
            : () => {
                handleEditModulesOrder();
              }
        }
        index={1}
        icon={isEditing ? "check" : "pencil"}
      />

      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
