import axios, { AxiosInstance } from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_MIDDLEEND_BASE_URL;

interface AxiosRequestConfig {
  uri?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  token?: string;
}

function createRequest(axiosRequestConfig: AxiosRequestConfig): AxiosInstance {
  return axios.create({
    baseURL: `${BASE_URL}/${axiosRequestConfig.uri}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${axiosRequestConfig.token}`,
      ...axiosRequestConfig.headers,
    },
    params: {
      ...axiosRequestConfig.params,
    },
  });
}

export const createRegisterUserRequest = (accessToken: string) => {
  return createRequest({ uri: "users/register/", token: accessToken });
};

export const createLoginUserRequest = (accessToken: string) => {
  return createRequest({ uri: "users/login/", token: accessToken });
};

export const createEditUserProfileRequest = (
  accessToken: string,
  userId: number
) => {
  return createRequest({
    uri: `users/${userId}`,
    token: accessToken,
    headers: { "X-Caller-Id": userId.toString() },
  });
};
