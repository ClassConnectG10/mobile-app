import { Avatar, Button, TextInput, useTheme, Text } from "react-native-paper";
import { StyleSheet, ScrollView, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import CountryPicker from "../components/CountryPicker";

const DEFAULT_SELECTED_COUNTRY: string = "Argentina";

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryName, setCountryName] = useState(DEFAULT_SELECTED_COUNTRY);

  const handleConfirmUserData = () => {
    if (!firstName || !lastName) {
      Alert.alert(
        "Error al registrar usuario",
        "Por favor, complete todos los campos",
        [{ text: "OK" }]
      );
      return;
    }
    router.push("/home");
  };

  const handleCountrySelect = (country: string) => {
    setCountryName(country);
    console.log("País seleccionado:", countryName);
  };

  return (
    <View
      style={[
        styles.mainContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Completá tus datos personales
        </Text>
        <View style={styles.userIconContainer}>
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

        <CountryPicker onCountrySelect={handleCountrySelect} />

        <Button
          icon="badge-account"
          mode="contained"
          onPress={handleConfirmUserData}
        >
          Confirmar datos
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
  linkText: {
    textAlign: "center",
    marginTop: 20,
  },
  link: {
    textDecorationLine: "underline",
  },
  userIconContainer: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
});
