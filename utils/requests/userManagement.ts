import UserInformation from "@/types/userInformation";
const axios = require("axios").default;

const BASE_URL = process.env.EXPO_PUBLIC_MIDDLEEND_BASE_URL;

export async function registerUser(
  uid: string,
  firstName: string,
  lastName: string,
  email: string,
  country: string
) {
  try {
    const response = await axios.post(`${BASE_URL}/users`, {
      uid: uid,
      name: firstName,
      surname: lastName,
      email: email,
      role: "user",
      country: country,
    });
    const userInfo = new UserInformation(
      response.data.data.name,
      response.data.data.surname,
      response.data.data.email,
      response.data.data.country
    );
    return userInfo;
  } catch (error) {
    throw new Error(`Error al registrar el usuario: ${error}`);
  }
}

export async function loginUser(uid: string) {
  try {
    const response = await axios.get(`${BASE_URL}/users/login/${uid}`);
    const userInfo = new UserInformation(
      response.data.data.name,
      response.data.data.surname,
      response.data.data.email,
      response.data.data.country
    );
    return userInfo;
  } catch (error) {
    throw new Error(`Error al iniciar sesion: ${error}`);
  }
}
