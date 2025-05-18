import UserCard from "@/components/cards/UserCard";
import { getUser } from "@/services/userManagement";
import {
  getCourseAssistants,
  getCourseStudents,
} from "@/services/courseManagement";
import { Course } from "@/types/course";
import { User } from "@/types/user";
import { useUserContext } from "@/utils/storage/userContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { ActivityIndicator, Divider, Text, useTheme } from "react-native-paper";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";

interface ParticipantsTabProps {
  course: Course;
}

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({ course }) => {
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [courseOwner, setCourseOwner] = useState<User | null>(null);
  const [assistants, setAssistants] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const userContext = useUserContext();

  async function fetchIsOwner() {
    if (!course.ownerId || !userContext.user) return;

    setIsOwner(course.ownerId === userContext.user?.id);
  }

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
    if (!userContext.user) return;

    if (user.id === userContext.user.id) {
      router.push("/users/me");
    } else {
      router.push({
        pathname: "/users/[userId]",
        params: { userId: user.id },
      });
    }
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

  useEffect(() => {
    fetchIsOwner();
    fetchCourseOwner();
    fetchAssistants();
    fetchStudents();
  }, [course]);

  return (
    <View style={{ paddingHorizontal: 20, flex: 1 }}>
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
            gap: 16,
          }}
        >
          <Text variant="titleMedium">Docente titular</Text>
          <UserCard
            user={courseOwner}
            onPress={() => {
              handleUserPress(courseOwner);
            }}
          />

          <Divider />

          <FlatList
            data={assistants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <UserCard
                user={item}
                onPress={() => {
                  handleUserPress(item);
                }}
              />
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
                <Text variant="titleMedium">No hay asistentes</Text>
              </View>
            }
            ListHeaderComponent={() => (
              <Text variant="titleMedium">Asistentes</Text>
            )}
          />
          <Divider />
          <FlatList
            data={students}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <UserCard
                user={item}
                onPress={() => {
                  handleUserPress(item);
                }}
              />
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
                <Text variant="titleMedium">No hay estudiantes</Text>
              </View>
            }
            ListHeaderComponent={() => (
              <Text variant="titleMedium">Estudiantes</Text>
            )}
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
