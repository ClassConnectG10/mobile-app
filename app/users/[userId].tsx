import { Avatar, Appbar, useTheme } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { globalStyles } from "@/styles/globalStyles";
import { useEffect, useState } from "react";
import { getUser } from "@/services/userManagement";
import { User } from "@/types/user";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/forms/TextField";

export default function UserDetailsPage() {
  const theme = useTheme();
  const router = useRouter();

  const { userId: userIdParam } = useLocalSearchParams();
  const userId = userIdParam as string;

  const [user, setUser] = useState<User>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false);

  const fetchUser = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const userFetched = await getUser(Number(userId));
      setUser(userFetched);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Perfil de usuario" />
        </Appbar.Header>

        {isLoading || !user ? (
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
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <View style={globalStyles.userIconContainer}>
              <Avatar.Icon size={96} icon="account" />
            </View>

            <TextField label="Nombre" value={user.userInformation.firstName} />
            <TextField label="Apellido" value={user.userInformation.lastName} />
            <TextField label="Email" value={user.userInformation.email} />
          </ScrollView>
        )}
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
