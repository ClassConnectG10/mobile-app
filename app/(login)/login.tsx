import { Button, Divider, Text, TextInput, useTheme } from "react-native-paper";
import { globalStyles } from "@/styles/globalStyles";
import { useRouter } from "expo-router";
import { loginSchema } from "@/validations/users";
import { loginUser } from "@/services/userManagement";
import { signIn } from "@/services/auth/authUtils";
import { useState } from "react";
import { useUserContext } from "@/utils/storage/userContext";
import { View, Image, Pressable } from "react-native";
import { ZodError } from "zod";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  fetchSignInMethodsForEmail,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const auth = getAuth();
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
      const user = await loginUser(uid);

      if (!user) {
        console.log("User not found in the user service");
        router.replace("/registerDetails");
        return;
      }

      setUser(user);

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

  const handleGoogleSignIn = async () => {
    setButtonDisabled(true);
    try {
      await GoogleSignin.hasPlayServices(); // Verifica que los servicios de Google Play estén disponibles
      const signInData = (await GoogleSignin.signIn()).data; // Obtiene el token de Google
      if (signInData) {
        const idToken = signInData.idToken;
        const googleEmail = signInData.user.email;

        // Crea una credencial de Firebase con el token de Google
        const googleCredential = GoogleAuthProvider.credential(idToken);

        // Inicia sesión en Firebase con la credencial de Google
        const signInMethods = await fetchSignInMethodsForEmail(
          auth,
          googleEmail
        );
        await signInWithCredential(auth, googleCredential);
        if (signInMethods.includes("google.com")) {
          const uid = auth.currentUser?.uid;
          const userInfo = await loginUser(uid);
          setUser(userInfo);
          router.replace("/home");
        } else {
          const firstName = signInData.user.givenName;
          const lastName = signInData.user.familyName;
          router.replace({
            pathname: "/registerDetails",
            params: { firstName, lastName },
          });
        }
      }
    } catch (error) {
      setErrorMessage(`Error al iniciar sesión con Google: ${error}`);
    } finally {
      setButtonDisabled(false);
    }
  };

  return (
    <>
      <View
        style={[
          {
            backgroundColor: theme.colors.onPrimary,
            padding: 20,
            flex: 1,
            gap: 20,
            justifyContent: "center",
          },
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

        <View style={{ gap: 16 }}>
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
          <Button
            icon="google"
            mode="outlined"
            disabled={buttonDisabled}
            onPress={() => handleGoogleSignIn()}
          >
            Continuar con Google
          </Button>

          <View style={{ gap: 20, marginTop: 10, alignItems: "center" }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={globalStyles.linkText}>¿No tenés una cuenta? </Text>
              <Pressable
                onPress={() => router.replace("/register")}
                style={{ flexDirection: "row" }}
              >
                <Text
                  style={[globalStyles.link, { color: theme.colors.primary }]}
                >
                  Registrate
                </Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={globalStyles.linkText}>
                ¿Olvidaste tu contraseña?{" "}
              </Text>
              <Pressable
                onPress={() => router.replace("/resetPassword")}
                style={{ flexDirection: "row" }}
              >
                <Text
                  style={[globalStyles.link, { color: theme.colors.primary }]}
                >
                  Recuperar contraseña
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
