import UserCard from "@/components/cards/UserCard";
import { SearchBar } from "@/components/forms/SearchBar";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import {
  addAssistantToCourse,
  getCourse,
  getCourseAssistants,
  getCourseStudents,
} from "@/services/courseManagement";
import { getUsers } from "@/services/userManagement";
import { Course } from "@/types/course";
import { User } from "@/types/user";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  useTheme,
  Text,
  IconButton,
  Dialog,
} from "react-native-paper";

const MIN_SEARCH_LENGTH = 3;

export default function AddAssistant() {
  const router = useRouter();
  const theme = useTheme();

  const { courseId: courseIdParam } = useLocalSearchParams();
  const courseId = courseIdParam as string;

  const [course, setCourse] = useState<Course>(null);
  const [assistants, setAssistants] = useState<User[]>(null);
  const [students, setStudents] = useState<User[]>(null);

  // const [users, setUsers] = useState<User[]>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [showConfirmationAdd, setShowConfirmationAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>(null);

  const userIsAnOwner = (user: User): boolean => {
    if (!course) return false;
    return user.id === course.ownerId;
  };

  const userIsAnAssistant = (user: User): boolean => {
    if (!assistants || !course) return false;
    return assistants.some((assistant) => assistant.id === user.id);
  };

  const userIsAStudent = (user: User): boolean => {
    if (!students) return false;
    return students.some((student) => student.id === user.id);
  };

  const handleUserPress = (user: User) => {
    router.push({
      pathname: "/users/[userId]",
      params: { userId: user.id },
    });
  };

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

  async function fetchStudents() {
    if (!courseId) return;

    setIsLoading(true);
    try {
      const students = await getCourseStudents(courseId);
      setStudents(students);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAssistants() {
    if (!courseId) return;

    setIsLoading(true);
    try {
      const assistants = await getCourseAssistants(courseId);
      setAssistants(assistants);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchCourse();
      fetchAssistants();
      fetchStudents();
    }, [courseId])
  );

  const handleAddAssistant = async () => {
    if (!courseId || !selectedUser) return;

    setIsLoading(true);
    try {
      await addAssistantToCourse(courseId, selectedUser.id);
      setShowConfirmationAdd(false);
      setSelectedUser(null);
      setAssistants((prev) => [...(prev || []), selectedUser]);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!assistants || !students || query.trim().length < MIN_SEARCH_LENGTH) {
      setFilteredUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const users = await getUsers();
      const posibleTeachers = users.filter((user) => {
        return (
          !userIsAnOwner(user) &&
          !userIsAnAssistant(user) &&
          !userIsAStudent(user)
        );
      });

      const serachQueryFilteredUsers = posibleTeachers.filter((user) => {
        const fullName = `${user.userInformation.firstName} ${user.userInformation.lastName}`;
        const revesedFullName = `${user.userInformation.lastName} ${user.userInformation.firstName}`;
        const email = user.userInformation.email;
        return (
          fullName.toLowerCase().includes(query.toLowerCase()) ||
          revesedFullName.toLowerCase().includes(query.toLowerCase()) ||
          email.toLowerCase().includes(query.toLowerCase())
        );
      });

      setFilteredUsers(serachQueryFilteredUsers);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

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
          <Appbar.Content title={"Adminsitrar asistentes"} />
        </Appbar.Header>

        <View
          style={{
            padding: 16,
            gap: 16,
            flex: 1,
          }}
        >
          <SearchBar placeholder="Buscar usuarios" onSearch={handleSearch} />
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <UserCard user={item} onPress={() => handleUserPress(item)} />
                <IconButton
                  icon="plus"
                  mode="contained"
                  size={24}
                  onPress={() => {
                    setShowConfirmationAdd(true);
                    setSelectedUser(item);
                  }}
                />
              </View>
            )}
            ListEmptyComponent={
              isLoading ? (
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
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>No hay usuarios que coincidan con la búsqueda</Text>
                </View>
              )
            }
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </View>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />

      <Dialog
        visible={showConfirmationAdd}
        onDismiss={() => setShowConfirmationAdd(false)}
      >
        <Dialog.Title>Atención</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            ¿Está seguro que desea agregar a{" "}
            {selectedUser?.userInformation.firstName}{" "}
            {selectedUser?.userInformation.lastName} como asistente?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirmationAdd(false)}>
            Cancelar
          </Button>
          <Button onPress={handleAddAssistant}>Agregar</Button>
        </Dialog.Actions>
      </Dialog>
    </>
  );
}
