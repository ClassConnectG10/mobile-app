import { Button, Divider, TextInput, useTheme, Text } from "react-native-paper";
import { ScrollView, View, Image } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { signUp } from "@/utils/auth/authUtils";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { storeValue } from "@/utils/storage/secureStorage";
import { credentialViewsStyles } from "@/styles/credentialViewsStyles";

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

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      showErrorMessageSnackbar("Por favor, complete todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      showErrorMessageSnackbar("Las contraseñas no coinciden");
      return;
    }
    try {
      const uid = await signUp(email, password);
      storeValue("email", email);
      storeValue("uid", uid);
      router.push("/registerDetails");
    } catch (error) {
      if (error instanceof Error) {
        showErrorMessageSnackbar(error.message);
      } else {
        showErrorMessageSnackbar("Error al registrar el usuario");
      }
    }
  };

  return (
    <View
      style={[
        credentialViewsStyles.mainContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          credentialViewsStyles.logoContainer,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <Image
          style={credentialViewsStyles.logo}
          resizeMode="cover"
          source={require("@/assets/images/logo.png")}
        />
      </View>

      <ScrollView
        style={credentialViewsStyles.container}
        contentContainerStyle={credentialViewsStyles.contentContainer}
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
        <Text style={credentialViewsStyles.linkText}>
          ¿Ya tenés una cuenta?{" "}
          <Link href="/login">
            <Text
              style={[
                credentialViewsStyles.link,
                { color: theme.colors.primary },
              ]}
            >
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
