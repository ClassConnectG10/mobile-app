import { Avatar, Button, TextInput, useTheme, Text } from "react-native-paper";
import { ScrollView, View } from "react-native";
import { useState } from "react";
import ErrorMessageSnackbar from "@/components/ErrorMessageSnackbar";
import { registerUser } from "@/services/userManagement";
import { globalStyles } from "@/styles/globalStyles";
import { registerDetailsSchema } from "@/validations/users";
import { useUserInformation } from "@/utils/storage/userInformationContext";
import { getAuth } from "firebase/auth";
import { useNavigation, CommonActions } from "@react-navigation/native";
import countries from "@/utils/constants/countries";
import OptionPicker from "@/components/OptionPicker";

const DEFAULT_SELECTED_COUNTRY: string = "Argentina";

export default function RegisterDetailsPage() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryName, setCountryName] = useState(DEFAULT_SELECTED_COUNTRY);
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { setUserInformation } = useUserInformation();
  const auth = getAuth();

  const onDismissErrorMessage = () => setErrorMessageVisible(false);

  const showErrorMessageSnackbar = (message: string) => {
    setErrorMessage(message);
    setErrorMessageVisible(true);
  };

  const handleConfirmUserData = async () => {
    setButtonDisabled(true);

    try {
      registerDetailsSchema.parse({
        firstName,
        lastName,
        countryName,
      });
      const user = auth.currentUser;
      const email = user?.email;
      const uid = user?.uid;
      if (!email || !uid) {
        showErrorMessageSnackbar(
          "Error en el registro de credenciales de usuario"
        );
        return;
      }
      const userInfo = await registerUser(
        uid,
        firstName,
        lastName,
        email,
        countryName
      );
      setUserInformation(userInfo);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "home" }],
        })
      );
    } catch (error) {
      if (error instanceof Error) {
        showErrorMessageSnackbar(error.message);
      } else {
        showErrorMessageSnackbar("Error al registrar el usuario");
      }
    } finally {
      setButtonDisabled(false);
    }
  };

  const handleCountrySelect = (country: string) => {
    setCountryName(country);
  };

  return (
    <View
      style={[
        globalStyles.mainContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={globalStyles.contentContainer}
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
          value={countryName}
          setValue={setCountryName}
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
      </ScrollView>
      <ErrorMessageSnackbar
        visible={errorMessageVisible}
        message={errorMessage}
        onDismiss={onDismissErrorMessage}
      />
    </View>
  );
}
