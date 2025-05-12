import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { loginUser } from "@/services/userManagement";
import { useUserContext } from "@/utils/storage/userContext";

export default function Index() {
  const theme = useTheme();
  const router = useRouter();
  const { setUser } = useUserContext();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const user = await loginUser(authUser.uid);
          setUser(user);
          router.replace("/home");
        } catch {
          console.log("No user session found");
          await auth.signOut();
          router.replace("/login");
        }
      } else {
        router.replace("/login");
      }
    });
  }, [router, setUser]);

  return (
    <View style={styles.background}>
      <Image
        style={styles.logo}
        resizeMode="cover"
        source={require("@/assets/images/logo.png")}
      />
      <ActivityIndicator
        animating={true}
        size="large"
        color={theme.colors.primary}
      />
      <Text
        variant="titleLarge"
        style={[styles.loadingMessage, { color: theme.colors.primary }]}
      >
        Iniciando sesión...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#DBC1FF",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 250,
    height: 250,
  },

  loadingMessage: {
    marginVertical: 30,
  },
});
