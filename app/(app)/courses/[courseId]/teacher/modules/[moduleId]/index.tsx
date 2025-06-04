import ActivityCard from "@/components/cards/ActivityCard";
import ModuleCard from "@/components/cards/ModuleCard";
import ResourceCard from "@/components/cards/ResourceCard";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { getModuleTeacherActivities } from "@/services/activityManagement";
import {
  getModule,
  getResources,
  orderResources,
} from "@/services/resourceManagment";
import { ActivityType, TeacherActivity } from "@/types/activity";
import { Module, Resource } from "@/types/resources";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SectionList, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Divider,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";

enum ModuleElementType {
  RESOURCE = "RESOURCE",
  ACTIVITY = "ACTIVITY",
}

class ModuleElement {
  constructor(
    public id: number,
    public type: ModuleElementType,
    public element: Resource | TeacherActivity,
  ) {}
}

export default function ModulePage() {
  const router = useRouter();
  const theme = useTheme();
  const { courseId: courseIdParam, moduleId: moduleIdParam } =
    useLocalSearchParams();
  const courseId = courseIdParam as string;
  const moduleId = Number(moduleIdParam);

  const [module, setModule] = useState<Module>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingResources, setIsEditingResources] = useState(false);

  const [activitiesDisplayElements, setActivitiesDisplayElements] = useState<
    ModuleElement[]
  >([]);

  const [resourcesDisplayElements, setResourcesDisplayElements] = useState<
    ModuleElement[]
  >([]);
  const [
    temporalResourcesDisplayElements,
    setTemporalResourcesDisplayElements,
  ] = useState<ModuleElement[]>([]);

  const moduleSections = [
    {
      title: "Recursos",
      data: temporalResourcesDisplayElements,
    },
    {
      title: "Actividades",
      data: activitiesDisplayElements,
    },
  ];

  const fetchModule = async () => {
    if (!courseId || !moduleId) return;
    setIsLoading(true);

    try {
      const module = await getModule(courseId, moduleId);
      setModule(module);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResources = async () => {
    if (!courseId || !moduleId) return;
    setIsLoading(true);
    try {
      const resources = await getResources(courseId, moduleId);
      const fetchedResources = resources.map(
        (resource) =>
          new ModuleElement(
            resource.resourceId,
            ModuleElementType.RESOURCE,
            resource,
          ),
      );
      setResourcesDisplayElements(fetchedResources);
      setTemporalResourcesDisplayElements(fetchedResources);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchActivities() {
    if (!courseId || !moduleId) return;
    setIsLoading(true);

    try {
      const activities = await getModuleTeacherActivities(courseId, moduleId);
      setActivitiesDisplayElements(
        activities.map((activity) => {
          return new ModuleElement(
            activity.activity.resourceId,
            ModuleElementType.ACTIVITY,
            activity,
          );
        }),
      );
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchModule(), fetchActivities(), fetchResources()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleActivityPress = (teacherActivity: TeacherActivity) => {
    const activityId = teacherActivity.activity.resourceId;

    if (teacherActivity.activity.type === ActivityType.TASK) {
      router.push({
        pathname: "/courses/[courseId]/teacher/activities/tasks/[taskId]",
        params: { courseId, taskId: activityId },
      });
    } else if (teacherActivity.activity.type === ActivityType.EXAM) {
      router.push({
        pathname: "/courses/[courseId]/teacher/activities/exams/[examId]",
        params: { courseId, examId: activityId },
      });
    }
  };

  const handleResourcePress = (resource: Resource) => {
    const resourceId = resource.resourceId;
    router.push({
      pathname: "/courses/[courseId]/teacher/resources/[resourceId]",
      params: { courseId, moduleId, resourceId },
    });
  };

  const handleCreateResource = () => {
    router.push({
      pathname: "/courses/[courseId]/teacher/resources/create",
      params: { courseId, moduleId },
    });
  };

  const handleMoveUpResource = (index: number) => {
    if (index <= 0) return;
    const newResources = [...temporalResourcesDisplayElements];
    const temp = newResources[index - 1];
    newResources[index - 1] = newResources[index];
    newResources[index] = temp;
    setTemporalResourcesDisplayElements(newResources);
  };

  const handleMoveDownResource = (index: number) => {
    if (index >= temporalResourcesDisplayElements.length - 1) return;
    const newResources = [...temporalResourcesDisplayElements];
    const temp = newResources[index + 1];
    newResources[index + 1] = newResources[index];
    newResources[index] = temp;
    setTemporalResourcesDisplayElements(newResources);
  };

  const handleEditResourcesOrder = () => {
    setTemporalResourcesDisplayElements(resourcesDisplayElements);
    setIsEditingResources(true);
  };

  const handleCancelResourcesOrder = () => {
    setTemporalResourcesDisplayElements(resourcesDisplayElements);
    setIsEditingResources(false);
  };

  const handleOrderResources = async () => {
    try {
      const resourceIds = temporalResourcesDisplayElements.map((el) => el.id);
      await orderResources(courseId, moduleId, resourceIds);
      setResourcesDisplayElements(temporalResourcesDisplayElements);
      setIsEditingResources(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchModule();
      fetchActivities();
      fetchResources();
    }, [courseId, moduleId]),
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/home");
              }
            }}
          />
          <Appbar.Content title="Contenido del módulo" />
          <Appbar.Action
            icon="information"
            onPress={() => {
              router.push({
                pathname: "/courses/[courseId]/teacher/modules/[moduleId]/info",
                params: { courseId, moduleId },
              });
            }}
          />
        </Appbar.Header>
        {isLoading || !module ? (
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
          <View style={{ padding: 16, flex: 1 }}>
            <SectionList
              sections={moduleSections}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              keyExtractor={(item, index) => item?.id.toString() + index}
              renderItem={({ item, index, section }) => {
                if (!item) return null;
                if (section.title === "Recursos") {
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <ResourceCard
                        resource={item.element as Resource}
                        onPress={() =>
                          handleResourcePress(item.element as Resource)
                        }
                      />
                      {isEditingResources && (
                        <View style={{ alignItems: "center", gap: 8 }}>
                          {index > 0 && (
                            <IconButton
                              mode="contained"
                              icon="arrow-up"
                              onPress={() => handleMoveUpResource(index)}
                              size={20}
                              style={{ margin: 0 }}
                            />
                          )}
                          {index <
                            temporalResourcesDisplayElements.length - 1 && (
                            <IconButton
                              mode="contained"
                              icon="arrow-down"
                              onPress={() => handleMoveDownResource(index)}
                              size={20}
                              style={{ margin: 0 }}
                            />
                          )}
                        </View>
                      )}
                    </View>
                  );
                } else if (section.title === "Actividades") {
                  return (
                    <ActivityCard
                      activity={item.element as TeacherActivity}
                      onPress={() =>
                        handleActivityPress(item.element as TeacherActivity)
                      }
                    />
                  );
                }
                return null;
              }}
              ListHeaderComponent={
                <>
                  <ModuleCard module={module} />
                  <View style={{ height: 8 }} />
                  <Divider />
                  <View style={{ height: 8 }} />
                </>
              }
              renderSectionHeader={({ section: { title } }) => {
                if (title === "Recursos") {
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 8,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text variant="titleMedium">{title}</Text>
                      {!isEditingResources ? (
                        <View style={{ flexDirection: "row", gap: 4 }}>
                          <IconButton
                            icon="pencil"
                            size={24}
                            style={{ margin: 0 }}
                            onPress={handleEditResourcesOrder}
                            accessibilityLabel="Editar orden de módulos"
                          />
                          <IconButton
                            icon="plus"
                            size={24}
                            style={{ margin: 0 }}
                            onPress={handleCreateResource}
                            accessibilityLabel="Editar orden de módulos"
                          />
                        </View>
                      ) : (
                        <View style={{ flexDirection: "row", gap: 4 }}>
                          <IconButton
                            icon="close"
                            size={24}
                            style={{ margin: 0 }}
                            onPress={handleCancelResourcesOrder}
                            accessibilityLabel="Cancelar"
                          />
                          <IconButton
                            icon="check"
                            size={24}
                            style={{ margin: 0 }}
                            onPress={handleOrderResources}
                            accessibilityLabel="Guardar orden"
                          />
                        </View>
                      )}
                    </View>
                  );
                }
                return (
                  <View style={{ paddingVertical: 8 }}>
                    <Text variant="titleMedium">{title}</Text>
                  </View>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text variant="titleMedium">
                    El módulo no tiene contenido
                  </Text>
                </View>
              }
              renderSectionFooter={({ section }) => {
                if (section.title === "Recursos" && section.data.length === 0) {
                  return (
                    <View style={{ alignItems: "center", marginVertical: 12 }}>
                      <Text variant="bodyMedium">No hay recursos.</Text>
                    </View>
                  );
                }
                if (
                  section.title === "Actividades" &&
                  section.data.length === 0
                ) {
                  return (
                    <View style={{ alignItems: "center", marginVertical: 12 }}>
                      <Text variant="bodyMedium">No hay actividades.</Text>
                    </View>
                  );
                }
                return null;
              }}
            />
          </View>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
