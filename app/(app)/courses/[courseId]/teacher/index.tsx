import {
  addCourseToFavorites,
  getCourse,
  removeCourseFromFavorites,
} from "@/services/courseManagement";
import { useCourseContext } from "@/utils/storage/courseContext";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Appbar,
  BottomNavigation,
  useTheme,
} from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import CourseCard from "@/components/cards/CourseCard";
import { View } from "react-native";
import ActivitiesTab from "@/components/courseTabs/teacher/activities";
import { ParticipantsTab } from "@/components/courseTabs/teacher/participants";
import { ModulesTab } from "@/components/courseTabs/teacher/modules";
import { StatisticsTab } from "@/components/courseTabs/teacher/statistics";
import { ForumTab } from "@/components/courseTabs/forum";

export default function CoursePage() {
  const router = useRouter();
  const theme = useTheme();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    {
      key: "activities",
      title: "Actividades",
      focusedIcon: "clipboard-text",
      unfocusedIcon: "clipboard-text",
    },
    {
      key: "modules",
      title: "Módulos",
      focusedIcon: "bookshelf",
      unfocusedIcon: "bookshelf",
    },
    {
      key: "forum",
      title: "Foro",
      focusedIcon: "forum",
      unfocusedIcon: "forum",
    },
    {
      key: "participants",
      title: "Miembros",
      focusedIcon: "account-multiple",
      unfocusedIcon: "account-multiple",
    },
    {
      key: "statistics",
      title: "Métricas",
      focusedIcon: "chart-bar",
      unfocusedIcon: "chart-bar",
    },
  ]);
  const courseContext = useCourseContext();
  const { setCourse } = courseContext;

  const renderScene = BottomNavigation.SceneMap({
    activities: ActivitiesTab,
    participants: () => {
      if (!courseContext.course) {
        return null;
      }
      return <ParticipantsTab course={courseContext.course} />;
    },
    modules: () => {
      if (!courseContext.course) {
        return null;
      }
      return <ModulesTab course={courseContext.course} />;
    },
    forum: () => {
      if (!courseContext.course) {
        return null;
      }
      return <ForumTab course={courseContext.course} />;
    },
    statistics: () => {
      if (!courseContext.course) {
        return null;
      }
      return <StatisticsTab course={courseContext.course} />;
    },
  });

  async function fetchCourse() {
    if (!courseId) return;

    setIsLoading(true);
    try {
      const course = await getCourse(courseId);
      setCourse(course);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFavoritePress = async () => {
    if (!courseContext.course) return;
    setIsLoading(true);

    try {
      if (courseContext.course.isFavorite) {
        await removeCourseFromFavorites(courseContext.course.courseId);
      } else {
        await addCourseToFavorites(courseContext.course.courseId);
      }

      setCourse({
        ...courseContext.course,
        isFavorite: !courseContext.course.isFavorite,
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoPress = () => {
    router.push({
      pathname: "/courses/[courseId]/info",
      params: { courseId },
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourse();
    }, [courseId])
  );

  return (
    <>
      <View style={{ flex: 1, overflow: "hidden" }}>
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
          <Appbar.Content title={courseContext.course?.courseDetails.title} />
          <Appbar.Action
            icon={courseContext.course?.isFavorite ? "heart" : "heart-outline"}
            onPress={handleFavoritePress}
            disabled={isLoading || !courseContext.course}
          />
          <Appbar.Action icon="information" onPress={handleInfoPress} />
        </Appbar.Header>
        {isLoading || !courseContext.course ? (
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
          <>
            <View
              style={{
                padding: 16,
                gap: 16,
              }}
            >
              {/* Card de curso */}
              <CourseCard
                course={courseContext.course}
                onPress={handleInfoPress}
              />
            </View>
            <BottomNavigation
              navigationState={{ index: tabIndex, routes }}
              onIndexChange={setTabIndex}
              renderScene={renderScene}
              labeled={true}
            />
          </>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
