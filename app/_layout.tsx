import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { UserProvider } from "@/utils/storage/userContext";
import { getMessaging } from "@react-native-firebase/messaging";
import { useNotification } from "@/services/notifications";

const DefaultTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#743EF4C0",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D1B3FF",
    onPrimaryContainer: "#3E1A8A",
    secondary: "#5E35B1",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#D1C4E9",
    onSecondaryContainer: "#311B92",
    background: "#ECECEC",
    onBackground: "#1A1A1A",
    surface: "#FFFFFF",
    onSurface: "#1A1A1A",
    error: "#D32F2F",
    onError: "#FFFFFF",
    outline: "#B39DDB",
  },
};

const messaging = getMessaging();
messaging.setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

export default function RootLayout() {
  useNotification();

  return (
    <PaperProvider theme={DefaultTheme}>
      <UserProvider>
        <StatusBar barStyle="dark-content" translucent={true} />
        <Stack screenOptions={{ headerShown: false }}></Stack>
      </UserProvider>
    </PaperProvider>
  );
}
