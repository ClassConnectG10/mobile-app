import { getModules, orderModules } from "@/services/resourceManagment";
import { Course } from "@/types/course";
import { Module } from "@/types/resources";
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
  const [temporalModules, setTemporalModules] = useState<Module[]>([]);

  async function fetchModules() {
    if (!course.courseId) return;

    setIsLoading(true);
    try {
      const fetchedModules = await getModules(course.courseId);
      setModules(fetchedModules);
      setTemporalModules(fetchedModules);
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

  const handleEditModulesOrder = async () => {
    if (!course.courseId) return;

    try {
      const modulesOrder = temporalModules.map((module) => module.moduleId);
      await orderModules(course.courseId, modulesOrder);
      setModules(temporalModules);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsEditing(false);
      setIsLoading(false);
    }
  };

  const handleCreateModule = () => {
    router.push({
      pathname: "/courses/[courseId]/teacher/modules/create",
      params: { courseId: course.courseId },
    });
  };

  const handleStartEditModulesOrder = () => {
    setTemporalModules(modules); // Start editing from current modules
    setIsEditing(true);
  };

  const handleCancelEditModulesOrder = () => {
    setTemporalModules(modules); // Restore original order
    setIsEditing(false);
  };

  const handleMoveUpModule = (index: number) => {
    const newModules = [...temporalModules];
    const temp = newModules[index - 1];
    newModules[index - 1] = newModules[index];
    newModules[index] = temp;
    setTemporalModules(newModules);
  };

  const handleMoveDownModule = (index: number) => {
    const newModules = [...temporalModules];
    const temp = newModules[index + 1];
    newModules[index + 1] = newModules[index];
    newModules[index] = temp;
    setTemporalModules(newModules);
  };

  const handlePressModule = (module: Module) => {
    router.push({
      pathname: "/courses/[courseId]/teacher/modules/[moduleId]",
      params: {
        courseId: course.courseId,
        moduleId: module.moduleId,
      },
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
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              justifyContent: "space-between",
            }}
          >
            <Text variant="titleMedium">Módulos</Text>

            {!isEditing ? (
              <View style={{ flexDirection: "row", gap: 4 }}>
                <IconButton
                  icon="pencil"
                  size={24}
                  style={{ margin: 0 }}
                  onPress={handleStartEditModulesOrder}
                  accessibilityLabel="Editar orden de módulos"
                />
                <IconButton
                  icon="plus"
                  size={24}
                  style={{ margin: 0 }}
                  onPress={handleCreateModule}
                  accessibilityLabel="Agregar módulo"
                />
              </View>
            ) : (
              <View style={{ flexDirection: "row", gap: 4 }}>
                <IconButton
                  icon="close"
                  size={24}
                  style={{ margin: 0 }}
                  onPress={handleCancelEditModulesOrder}
                  accessibilityLabel="Cancelar"
                />
                <IconButton
                  icon="check"
                  size={24}
                  style={{ margin: 0 }}
                  onPress={handleEditModulesOrder}
                  accessibilityLabel="Guardar orden"
                />
              </View>
            )}
          </View>
          <FlatList
            data={temporalModules}
            keyExtractor={(item) => item.moduleId.toString()}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            renderItem={({ item, index }) => (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <ModuleCard
                  module={item}
                  onPress={() => handlePressModule(item)}
                />
                {isEditing &&
                  (index > 0 || index < temporalModules.length - 1) && (
                    <View
                      style={{
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {index > 0 && (
                        <IconButton
                          mode="contained"
                          style={{ margin: 0 }}
                          icon="arrow-up"
                          size={16}
                          onPress={() => {
                            handleMoveUpModule(index);
                          }}
                        />
                      )}
                      {index < temporalModules.length - 1 && (
                        <IconButton
                          mode="contained"
                          style={{ margin: 0 }}
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
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
