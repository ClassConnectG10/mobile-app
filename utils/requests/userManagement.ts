import UserInformation from "@/types/userInformation";
const axios = require("axios").default;

const BASE_URL = process.env.EXPO_PUBLIC_MIDDLEEND_BASE_URL;

/**
 * Registers a new user in the system by sending their information to the server.
 *
 * @param uid - The unique identifier for the user.
 * @param firstName - The first name of the user.
 * @param lastName - The last name of the user.
 * @param email - The email address of the user.
 * @param country - The country of the user.
 * @returns A `UserInformation` object containing the registered user's details.
 * @throws An error if the registration process fails.
 */
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

/**
 * Logs in a user by their unique identifier (UID) and retrieves their information.
 *
 * @param uid - The unique identifier of the user to log in.
 * @returns A promise that resolves to an instance of `UserInformation` containing
 *          the user's name, surname, email, and country.
 * @throws An error if the login request fails.
 */
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
