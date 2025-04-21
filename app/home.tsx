import { Avatar, Text, Button } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  getStoredObject,
  deleteStoredObject,
} from "@/utils/storage/secureStorage";
import UserInformation from "@/types/userInformation";
import { USER_INFORMATION_KEY } from "@/utils/constants/storedKeys";

export default function HomePage() {
  const [userInfo, setUserInfo] = useState<UserInformation | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const data = await getStoredObject(USER_INFORMATION_KEY);
      setUserInfo(data);
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    setButtonDisabled(true);
    await deleteStoredObject(USER_INFORMATION_KEY);
    router.replace("/login");
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
        <Text variant="titleMedium">Nombre: {userInfo?.firstName}</Text>
        <Text variant="titleMedium">Apellido: {userInfo?.lastName}</Text>
        <Text variant="titleMedium">Email: {userInfo?.email}</Text>
        <Text variant="titleMedium">País: {userInfo?.country}</Text>
      </View>
      <Button
        mode="contained"
        onPress={handleLogout}
        disabled={buttonDisabled}
        style={{ marginTop: 20 }}
      >
        Cerrar sesión
      </Button>
      1
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
