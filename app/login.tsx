import { Button, Divider, Text, TextInput, useTheme } from "react-native-paper";
import { View, Image, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { signIn } from "@/services/auth/authUtils";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { loginUser } from "@/services/userManagement";
import UserInformation from "@/types/userInformation";
import { credentialViewsStyles } from "@/styles/credentialViewsStyles";
import { loginSchema } from "@/validations/users";
import { useUserInformation } from "@/utils/storage/userInformationContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { setUserInformation } = useUserInformation();

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
      }
    });

    return unsubscribe;
  }, [router, setUserInformation]);

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
      router.push("/home");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
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
        <Text style={credentialViewsStyles.linkText}>
          ¿No tenés una cuenta?{" "}
          <Link href="/register">
            <Text
              style={[
                credentialViewsStyles.link,
                { color: theme.colors.primary },
              ]}
            >
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
