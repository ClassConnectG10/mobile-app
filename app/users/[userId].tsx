import { Avatar, Appbar } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { globalStyles } from "@/styles/globalStyles";
import { useEffect, useState } from "react";
import { getUser } from "@/services/userManagement";
import { User } from "@/types/user";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { TextField } from "@/components/TextField"; // Importá tu componente

export default function UserDetailsPage() {
  const router = useRouter();
  const { userId: userIdParam } = useLocalSearchParams();
  const userId = userIdParam as string;

  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const userFetched = await getUser(Number(userId));
        setUser(userFetched);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <TextField
          label="Error"
          value="No se pudo cargar la información del usuario."
        />
      </View>
    );
  }

  const { firstName, lastName, email, country } = user.userInformation;

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Perfil de usuario" />
      </Appbar.Header>

      <View style={globalStyles.mainContainer}>
        <ScrollView contentContainerStyle={globalStyles.courseDetailsContainer}>
          <View style={globalStyles.userIconContainer}>
            <Avatar.Icon size={96} icon="account" />
          </View>

          <TextField label="Nombre" value={firstName} />
          <TextField label="Apellido" value={lastName} />
          <TextField label="Email" value={email} />
          <TextField label="País" value={country} />
        </ScrollView>

        <ErrorMessageSnackbar
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      </View>
    </>
  );
}
