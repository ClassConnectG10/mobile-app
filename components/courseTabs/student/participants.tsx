import UserCard from "@/components/cards/UserCard";
import { getUser } from "@/services/userManagement";
import {
  getCourseAssistants,
  getCourseStudents,
} from "@/services/courseManagement";
import { Course } from "@/types/course";
import { User } from "@/types/user";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SectionList, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";

interface ParticipantsTabProps {
  course: Course;
}

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({ course }) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [courseOwner, setCourseOwner] = useState<User | null>(null);
  const [assistants, setAssistants] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const participantsSections = [
    {
      title: "Docente titular",
      data: [courseOwner],
    },
    {
      title: "Asistentes",
      data: assistants,
    },
    {
      title: "Estudiantes",
      data: students,
    },
  ];

  async function fetchCourseOwner() {
    try {
      setIsLoading(true);
      const courseOwner = await getUser(course.ownerId);
      setCourseOwner(courseOwner);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUserPress = (user: User) => {
    router.push({
      pathname: "/users/[userId]",
      params: { userId: user.id },
    });
  };

  async function fetchAssistants() {
    try {
      setIsLoading(true);
      const assistants = await getCourseAssistants(course.courseId);
      setAssistants(assistants);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchStudents() {
    try {
      setIsLoading(true);
      const students = await getCourseStudents(course.courseId);
      setStudents(students);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchCourseOwner();
      fetchAssistants();
      fetchStudents();
    }, [course]),
  );

  return (
    <View style={{ paddingHorizontal: 16, flex: 1 }}>
      {isLoading || !courseOwner ? (
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
            flex: 1,
            gap: 16,
          }}
        >
          <SectionList
            sections={participantsSections}
            keyExtractor={(item, index) => item?.id.toString() + index}
            renderItem={({ item }) => {
              if (!item) return null;

              return (
                <UserCard
                  user={item}
                  onPress={() => {
                    handleUserPress(item);
                  }}
                />
              );
            }}
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
                <Text variant="titleMedium">No hay participantes</Text>
              </View>
            }
            renderSectionFooter={({ section }) => {
              if (section.title === "Asistentes" && section.data.length === 0) {
                return (
                  <View style={{ alignItems: "center", marginVertical: 12 }}>
                    <Text variant="bodyMedium">
                      No hay asistentes en este curso.
                    </Text>
                  </View>
                );
              }
              if (
                section.title === "Estudiantes" &&
                section.data.length === 0
              ) {
                return (
                  <View style={{ alignItems: "center", marginVertical: 12 }}>
                    <Text variant="bodyMedium">
                      No hay estudiantes inscriptos.
                    </Text>
                  </View>
                );
              }
              return null;
            }}
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
