import axios, { AxiosInstance } from "axios";
import { getAuth } from "@react-native-firebase/auth";

const BASE_URL = process.env.EXPO_PUBLIC_MIDDLEEND_BASE_URL;

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export interface AxiosRequestConfig {
  uri?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

async function getAccessToken(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    return token;
  }

  throw new Error("User is not authenticated");
}

export async function createRequest(
  axiosRequestConfig: AxiosRequestConfig,
): Promise<AxiosInstance> {
  const token = await getAccessToken();
  return axios.create({
    baseURL: `${BASE_URL}/${axiosRequestConfig.uri}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...axiosRequestConfig.headers,
    },
    params: {
      ...axiosRequestConfig.params,
    },
  });
}
