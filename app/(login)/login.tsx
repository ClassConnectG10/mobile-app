import { Button, Divider, Text, TextInput, useTheme } from "react-native-paper";
import { globalStyles } from "@/styles/globalStyles";
import { Link, useRouter } from "expo-router";
import { loginSchema } from "@/validations/users";
import { loginUser } from "@/services/userManagement";
import { signIn } from "@/services/auth/authUtils";
import { useState } from "react";
import { useUserContext } from "@/utils/storage/userContext";
import { View, Image, ScrollView } from "react-native";
import { ZodError } from "zod";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import UserInformation from "@/types/userInformation";
import { getAuth } from "firebase/auth";

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { setUser } = useUserContext();

  const handleLogin = async () => {
    setButtonDisabled(true);

    try {
      loginSchema.parse({ email, password });

      const uid = await signIn(email, password);
      const userInfo = await loginUser(uid);

      setUser(userInfo);

      router.replace("/home");
    } catch (error) {
      if (error instanceof ZodError) {
        setErrorMessage(error.errors[0].message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
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
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </View>
  );
}
