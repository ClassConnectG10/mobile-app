import { Avatar, Button, TextInput, useTheme, Text } from "react-native-paper";
import { View } from "react-native";
import { useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { registerUser } from "@/services/userManagement";
import { globalStyles } from "@/styles/globalStyles";
import { useUserContext } from "@/utils/storage/userContext";
import { getAuth } from "@react-native-firebase/auth";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { countries, defaultCountry } from "@/utils/constants/countries";
import OptionPicker from "@/components/OptionPicker";
import { useLocalSearchParams } from "expo-router";

export default function RegisterDetailsPage() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { firstName: initialFirstName, lastName: initialLastName } =
    useLocalSearchParams();
  const [firstName, setFirstName] = useState(initialFirstName as string);
  const [lastName, setLastName] = useState(initialLastName as string);
  const [country, setcountry] = useState(defaultCountry);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { setUser } = useUserContext();
  const auth = getAuth();

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
        firstName,
        lastName,
        email,
        country,
      };
      const newUserInfo = await registerUser(uid, userInfo);
      setUser(newUserInfo);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "home" }],
        })
      );
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
          <Avatar.Icon size={96} icon="account" />
        </View>
        <TextInput
          label="Nombre"
          value={firstName}
          onChangeText={setFirstName}
        ></TextInput>
        <TextInput
          label="Apellido"
          value={lastName}
          onChangeText={setLastName}
        ></TextInput>

        <OptionPicker
          label="País de residencia"
          value={country}
          setValue={setcountry}
          items={countries}
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
