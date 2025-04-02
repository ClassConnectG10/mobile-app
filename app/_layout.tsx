import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider theme={DefaultTheme} >
      <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </PaperProvider>
  );
}
