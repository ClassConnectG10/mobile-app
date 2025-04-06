import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

const DefaultTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#743EF4",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D1B3FF",
    onPrimaryContainer: "#3E1A8A",
    secondary: "#5E35B1",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#D1C4E9",
    onSecondaryContainer: "#311B92",
    background: "#F3E5F5",
    onBackground: "#1A1A1A",
    surface: "#FFFFFF",
    onSurface: "#1A1A1A",
    error: "#D32F2F",
    onError: "#FFFFFF",
    outline: "#B39DDB",
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={DefaultTheme}>
      <StatusBar barStyle="dark-content" translucent={true} />
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </PaperProvider>
  );
}
