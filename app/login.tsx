import { Button, Divider, Text, TextInput, useTheme } from "react-native-paper";
import { StyleSheet, View, Image, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { signIn } from "@/utils/auth/authUtils";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { loginUser } from "@/utils/requests/userManagement";
import { storeObject } from "@/utils/storage/secureStorage";
import UserInformation from "@/types/userInformation";

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onDismissErrorMessage = () => setErrorMessageVisible(false);

  const showErrorMessageSnackbar = (message: string) => {
    setErrorMessage(message);
    setErrorMessageVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showErrorMessageSnackbar("Por favor, complete todos los campos");
      return;
    }
    try {
      const uid = await signIn(email, password);
      const userInfo = await loginUser(uid);
      storeObject("userInformation", userInfo);
      router.push("/home");
    } catch (error) {
      if (error instanceof Error) {
        showErrorMessageSnackbar(error.message);
      } else {
        showErrorMessageSnackbar("Error al iniciar sesión");
      }
    }
  };

  return (
    <View
      style={[
        styles.mainContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.logoContainer,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <Image
          style={styles.logo}
          resizeMode="cover"
          source={require("@/assets/images/logo.png")}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <TextInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
        ></TextInput>
        <TextInput
          label="Contraseña"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        ></TextInput>
        <Button icon="login" mode="contained" onPress={handleLogin}>
          Ingresar
        </Button>
        <Divider />
        <Button icon="google" mode="outlined">
          Continuar con Google
        </Button>
        <Button icon="microsoft" mode="outlined">
          Continuar con Microsoft
        </Button>
        <Text style={styles.linkText}>
          ¿No tenés una cuenta?{" "}
          <Link href="/register">
            <Text style={[styles.link, { color: theme.colors.primary }]}>
              Registrate
            </Text>
          </Link>
        </Text>
      </ScrollView>
      <ErrorMessageSnackbar
        visible={errorMessageVisible}
        message={errorMessage}
        onDismiss={onDismissErrorMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: "center",
    gap: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  loginContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    textAlign: "center",
    marginTop: 20,
  },
  link: {
    textDecorationLine: "underline",
  },
  logoContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
});
