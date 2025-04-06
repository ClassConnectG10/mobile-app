import { Button, Divider, TextInput, useTheme } from "react-native-paper";
import { StyleSheet, ScrollView, View, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();
  const [firstNames, setFirstNames] = useState("");
  const [lastNames, setLastNames] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const createUserAlreadyExistsAlert = () => {
    Alert.alert(
      "Error al registrar usuario",
      "El usuario con los datos ingresados ya existe",
      [{ text: "OK" }]
    );
  };

  const handleRegister = () => {
    if (!firstNames || !lastNames || !email || !password || !confirmPassword) {
      createUserAlreadyExistsAlert();
      return;
    }
    router.push("/home");
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
          label="Nombres"
          value={firstNames}
          onChangeText={setFirstNames}
        ></TextInput>
        <TextInput
          label="Apellidos"
          value={lastNames}
          onChangeText={setLastNames}
        ></TextInput>
        <Divider />
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
      </ScrollView>
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
