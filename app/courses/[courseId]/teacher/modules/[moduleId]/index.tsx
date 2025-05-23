import ActivityCard from "@/components/cards/ActivityCard";
import ModuleCard from "@/components/cards/ModuleCard";
import ResourceCard from "@/components/cards/ResourceCard";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { getModuleTeacherActivities } from "@/services/activityManagement";
import { getModule } from "@/services/resourceManager";
import { ActivityType, TeacherActivity } from "@/types/activity";
import { UserRole } from "@/types/course";
import { Module, Resource } from "@/types/resources";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SectionList, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Divider,
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
  const {
    courseId: courseIdParam,
    moduleId: moduleIdParam,
    userRole: userRoleParam,
  } = useLocalSearchParams();
  const courseId = courseIdParam as string;
  const moduleId = Number(moduleIdParam);
  const userRole = userRoleParam as UserRole;

  const [module, setModule] = useState<Module>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [, setActivities] = useState<TeacherActivity[]>(null);
  const [activitiesDisplayElements, setActivitiesDisplayElements] = useState<
    ModuleElement[]
  >([]);

  // const [resources, setResources] = useState<Resource[]>(null);
  const [resourcesDisplayElements, setResourcesDisplayElements] = useState<
    ModuleElement[]
  >([]);

  const moduleSections = [
    {
      title: "Recursos",
      data: resourcesDisplayElements,
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

    // TODO: Fetch resources from the module
    setResourcesDisplayElements([]);
  };

  async function fetchActivities() {
    if (!courseId || !moduleId) return;
    setIsLoading(true);

    try {
      const activities = await getModuleTeacherActivities(courseId, moduleId);
      setActivities(activities);
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
                params: { courseId, moduleId, userRole },
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
          <View style={{ padding: 16 }}>
            <SectionList
              sections={moduleSections}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              keyExtractor={(item, index) => item?.id.toString() + index}
              renderItem={({ item }) => {
                if (!item) return null;

                return (
                  <View>
                    {item.type === ModuleElementType.ACTIVITY ? (
                      <ActivityCard
                        activity={item.element as TeacherActivity}
                        onPress={() =>
                          handleActivityPress(item.element as TeacherActivity)
                        }
                      />
                    ) : (
                      <ResourceCard
                        resource={item.element as Resource}
                        onPress={() => {}}
                      />
                    )}
                  </View>
                );
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
