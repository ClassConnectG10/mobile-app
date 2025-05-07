import { Button, Divider, Text, TextInput, useTheme } from "react-native-paper";
import { globalStyles } from "@/styles/globalStyles";
import { Link, useRouter } from "expo-router";
import { loginSchema } from "@/validations/users";
import { loginUser } from "@/services/userManagement";
import { signIn } from "@/services/auth/authUtils";
import { useState } from "react";
import { useUserInformationContext } from "@/utils/storage/userInformationContext";
import { View, Image, ScrollView } from "react-native";
import { ZodError } from "zod";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import UserInformation from "@/types/userInformation";

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { setUserInformation } = useUserInformationContext();

  const onDismissErrorMessage = () => setErrorMessageVisible(false);

  const showErrorMessageSnackbar = (message: string) => {
    setErrorMessage(message);
    setErrorMessageVisible(true);
  };

  const handleLogin = async () => {
    setButtonDisabled(true);

    try {
      loginSchema.parse({ email, password });

      const uid = await signIn(email, password);
      const userInfo: UserInformation = await loginUser(uid);
      setUserInformation(userInfo);
      router.replace("/home");
    } catch (error) {
      if (error instanceof ZodError) {
        showErrorMessageSnackbar(error.errors[0].message);
      } else if (error instanceof Error) {
        showErrorMessageSnackbar(error.message);
      } else {
        showErrorMessageSnackbar("Error al iniciar sesión");
      }
    } finally {
      setButtonDisabled(false);
    }
  };

  return (
    <View
      style={[
        globalStyles.mainContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          globalStyles.logoContainer,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
      >
        <Image
          style={globalStyles.logo}
          resizeMode="cover"
          source={require("@/assets/images/logo.png")}
        />
      </View>

      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={globalStyles.contentContainer}
      >
        <TextInput
          label="Correo electrónico"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        ></TextInput>
        <TextInput
          label="Contraseña"
          autoCapitalize="none"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        ></TextInput>
        <Button
          icon="login"
          mode="contained"
          disabled={buttonDisabled}
          onPress={handleLogin}
        >
          Ingresar
        </Button>
        <Divider />
        <Button icon="google" mode="outlined">
          Continuar con Google
        </Button>
        <Button icon="microsoft" mode="outlined">
          Continuar con Microsoft
        </Button>
        <Text style={globalStyles.linkText}>
          ¿No tenés una cuenta?{" "}
          <Link href="/register">
            <Text style={[globalStyles.link, { color: theme.colors.primary }]}>
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
