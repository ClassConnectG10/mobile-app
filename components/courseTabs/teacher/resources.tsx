import { getResources } from "@/services/resourceManager";
import { Course } from "@/types/course";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import { FlatList, View } from "react-native";
import { useTheme, Text, ActivityIndicator } from "react-native-paper";
import ErrorMessageSnackbar from "../../ErrorMessageSnackbar";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Resource } from "@/types/resources";
import ResourceCard from "@/components/cards/ResourceCard";

interface ResourcesTabProps {
  course: Course;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ course }) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [resources, setResources] = useState<Resource[]>([]);

  async function fetchResources() {
    if (!course.courseId) return;

    setIsLoading(true);
    try {
      const resources = await getResources(course.courseId);
      setResources(resources);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchResources();
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchResources();
    }, [course.courseId]),
  );

  const handleCreateResource = () => {
    // router.push({
    //   pathname: "/courses/[courseId]/teacher/resources/create",
    //   params: { courseId: course.courseId },
    // });
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
            data={resources}
            keyExtractor={(item) => item.resourceId.toString()}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            renderItem={({ item }) => (
              <ResourceCard
                resource={item}
                // onPress={() => {
                //   router.push({
                //     pathname: "/courses/[courseId]/teacher/modules/[moduleId]",
                //     params: {
                //       courseId: course.courseId,
                //       moduleId: item.moduleId,
                //     },
                //   });
                // }}
              />
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
                <Text variant="titleMedium">No hay recursos</Text>
              </View>
            }
          />
        </View>
      )}
      <FloatingActionButton onPress={handleCreateResource} />
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
};
