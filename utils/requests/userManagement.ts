const axios = require('axios').default;

const BASE_URL = "https://cc-middleend.onrender.com";

export async function registerUser(uid: string, firstName: string, lastName: string, email: string, country: string) {
  try {
    console.log("Registering user with UID:", uid);
    const response = await axios.post(`${BASE_URL}/users`, {
      uid: uid,
      name: firstName,
      surname: lastName,
      email: email,
      role: "user",
      country: country,
    });
    console.log("User registered:", response.data);
    return response.data;
  } catch (error) {
    console.log("Error registering user:", error);
    throw error;
  }
}

export async function loginUser(uid: string) {
  try {
    const response = await axios.get(`${BASE_URL}/users/login/${uid}`);
    console.log("User logged in:", response.data);
    return response.data;
  } catch (error) {
    console.log("Error logging in user:", error);
    throw error;
  }
}