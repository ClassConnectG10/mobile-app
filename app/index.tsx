import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UserInformation from "@/types/userInformation";
import { loginUser } from "@/services/userManagement";
import { useUserInformationContext } from "@/utils/storage/userInformationContext";

export default function Index() {
  const theme = useTheme();
  const router = useRouter();
  const { setUserInformation } = useUserInformationContext();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userInfo: UserInformation = await loginUser(user.uid);
          setUserInformation(userInfo);
          router.replace("/home");
        } catch {
          console.log("No user session found");
        }
      } else {
        router.replace("/login");
      }
    });

    return unsubscribe;
  }, [router, setUserInformation]);

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
