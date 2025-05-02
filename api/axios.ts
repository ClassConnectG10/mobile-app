import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_MIDDLEEND_BASE_URL;

const createRegisterUserRequest = () => {
  return axios.create({
    baseURL: `${BASE_URL}/users`,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const createLoginUserRequest = () => {
  return axios.create({
    baseURL: `${BASE_URL}/users/login/`,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export { createRegisterUserRequest, createLoginUserRequest };
