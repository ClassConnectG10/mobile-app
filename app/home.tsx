import { Avatar, Text, Button } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { useUserInformationContext } from "@/utils/storage/userInformationContext";
import { getAuth, signOut } from "firebase/auth";

export default function HomePage() {
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { userInformation, deleteUserInformation } =
    useUserInformationContext();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      setButtonDisabled(true);
      deleteUserInformation();
      await signOut(auth);
      router.replace("/login");
    } catch {
      console.error("Error al cerrar sesión");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: true,
          headerBackVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#6200ee",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      ></Stack.Screen>
      <Text variant="headlineLarge">Tus datos</Text>
      <View style={styles.userIconContainer}>
        <Avatar.Icon size={96} icon="account" />
      </View>
      <View style={styles.dataContainer}>
        <Text variant="titleMedium">Nombre: {userInformation?.firstName}</Text>
        <Text variant="titleMedium">Apellido: {userInformation?.lastName}</Text>
        <Text variant="titleMedium">Email: {userInformation?.email}</Text>
        <Text variant="titleMedium">País: {userInformation?.country}</Text>
      </View>
      <Button
        mode="contained"
        onPress={() => {
          router.push("/createCourse");
        }}
        disabled={buttonDisabled}
        style={{ marginTop: 20 }}
      >
        Crear curso
      </Button>
      <Button
        mode="contained"
        onPress={() => {
          router.push("/userProfile");
        }}
        disabled={buttonDisabled}
        style={{ marginTop: 20 }}
      >
        Mis datos
      </Button>
      <Button
        mode="contained"
        onPress={handleLogout}
        disabled={buttonDisabled}
        style={{ marginTop: 20 }}
      >
        Cerrar sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  userIconContainer: {
    alignItems: "center",
  },
  dataContainer: {
    alignItems: "center",
  },
});
