import { Button, useTheme, Text } from "react-native-paper";
import { View } from "react-native";
import { useState, useEffect } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { registerUser } from "@/services/userManagement";
import { globalStyles } from "@/styles/globalStyles";
import { useUserContext } from "@/utils/storage/userContext";
import { getAuth } from "@react-native-firebase/auth";
import { COUNTRIES, defaultCountry } from "@/utils/constants/countries";
import OptionPicker from "@/components/forms/OptionPicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ToggleableProfilePicture } from "@/components/forms/ToggleableProfilePicture";
import { useUserInformation } from "@/hooks/useUserInformation";
import { ToggleableTextInput } from "@/components/forms/ToggleableTextInput";

export default function RegisterDetailsPage() {
  const theme = useTheme();
  const router = useRouter();

  const { firstName: initialFirstName, lastName: initialLastName } =
    useLocalSearchParams();

  const userInformationHook = useUserInformation();
  const userInformation = userInformationHook.userInformation;

  const auth = getAuth();
  const { setUser } = useUserContext();

  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    userInformationHook.setCountry(defaultCountry);
  }, []);

  useEffect(() => {
    userInformationHook.setFirstName(initialFirstName as string);
  }, [initialFirstName]);

  useEffect(() => {
    userInformationHook.setLastName(initialLastName as string);
  }, [initialLastName]);

  const handleConfirmUserData = async () => {
    setButtonDisabled(true);

    try {
      const user = auth.currentUser;
      const accessToken = await user?.getIdToken();
      const email = user?.email;
      const uid = user?.uid;

      if (!email || !uid || !accessToken) {
        setErrorMessage(
          "Error al obtener el token de acceso o el uid del usuario"
        );
        return;
      }
      const userInfo = {
        firstName: userInformation.firstName,
        lastName: userInformation.lastName,
        email,
        profilePicture: userInformation.profilePicture,
        country: userInformation.country,
      };

      console.log("Registering user with info:", userInfo);

      const newUser = await registerUser(uid, userInfo);
      setUser(newUser);
      router.replace("/home");
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setButtonDisabled(false);
    }
  };

  return (
    <>
      <View
        style={{
          backgroundColor: theme.colors.onPrimary,
          padding: 20,
          flex: 1,
          gap: 20,
          justifyContent: "center",
        }}
      >
        <Text
          variant="titleLarge"
          style={[globalStyles.title, { color: theme.colors.onBackground }]}
        >
          Completá tus datos personales
        </Text>
        <View style={globalStyles.userIconContainer}>
          <ToggleableProfilePicture
            file={userInformation.profilePicture}
            setFile={userInformationHook.setProfilePicture}
            editable={true}
            size={96}
          />
        </View>

        <ToggleableTextInput
          label="Nombre"
          placeholder="Nombre"
          value={userInformation.firstName}
          onChange={userInformationHook.setFirstName}
          editable={true}
        />

        <ToggleableTextInput
          label="Apellido"
          placeholder="Apellido"
          value={userInformation.lastName}
          onChange={userInformationHook.setLastName}
          editable={true}
        />

        <OptionPicker
          label="País de residencia"
          value={userInformation.country}
          setValue={userInformationHook.setCountry}
          items={COUNTRIES}
          editable={true}
        />

        <Button
          icon="badge-account"
          mode="contained"
          disabled={buttonDisabled}
          onPress={handleConfirmUserData}
        >
          Confirmar datos
        </Button>
      </View>
      <ErrorMessageSnackbar
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />
    </>
  );
}
