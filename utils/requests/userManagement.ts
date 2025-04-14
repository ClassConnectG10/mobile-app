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
  await axios.post(`${BASE_URL}/users`, {
    uid: uid,
    name: firstName,
    surname: lastName,
    email: email,
    role: "user",
    country: country,
  });
}

export async function loginUser(uid: string) {
  const response = await axios.get(`${BASE_URL}/users/login/${uid}`);
  const userInfo = new UserInformation(
    response.data.data.name,
    response.data.data.surname,
    response.data.data.email,
    response.data.data.country
  );
  console.log("User logged in:", response.data);
  return userInfo;
}
