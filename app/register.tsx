import { Button, Divider, TextInput, useTheme, Text } from "react-native-paper";
import { StyleSheet, ScrollView, View, Image } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { signUp } from "./utils/auth/authUtils";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onDismissErrorMessage = () => setErrorMessageVisible(false);

  const showErrorMessageSnackbar = (message: string) => {
    setErrorMessage(message);
    setErrorMessageVisible(true);
  };

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      showErrorMessageSnackbar("Por favor, complete todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      showErrorMessageSnackbar("Las contraseñas no coinciden");
      return;
    }
    signUp(email, password);
    router.push("/registerDetails");
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
        <TextInput
          label="Repetir contraseña"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        ></TextInput>
        <Button icon="account-plus" mode="contained" onPress={handleRegister}>
          Registrar
        </Button>
        <Divider />
        <Button icon="google" mode="outlined">
          Continuar con Google
        </Button>
        <Button icon="microsoft" mode="outlined">
          Continuar con Microsoft
        </Button>
        <Text style={styles.linkText}>
          ¿Ya tenés una cuenta?{" "}
          <Link href="/login">
            <Text style={[styles.link, { color: theme.colors.primary }]}>
              Iniciá sesión
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
