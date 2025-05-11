import axios, { AxiosInstance } from "axios";
import { getAuth } from "firebase/auth";

const BASE_URL = process.env.EXPO_PUBLIC_MIDDLEEND_BASE_URL;

interface AxiosRequestConfig {
  uri?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

async function getAccessToken(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    console.log("Token:", token);
    return token;
  }

  throw new Error("User is not authenticated");
}

// function getuserId(): number {
//   const userContextHook = useUserContext();
//   if (userContextHook.user) {
//     return userContextHook.user.id;
//   }

//   throw new Error("User ID not found in context");
// }

async function createRequest(
  axiosRequestConfig: AxiosRequestConfig
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

// async function createRequestWithXCallwerId(
//   axiosRequestConfig: AxiosRequestConfig
// ): Promise<AxiosInstance> {

//   return await createRequest({
//     ...axiosRequestConfig,
//     headers: {
//       ...axiosRequestConfig.headers,
//       "X-Caller-ID": userId.toString(),
//     },
//   });
// }

export const createRegisterUserRequest = () => {
  return createRequest({ uri: "users/register/" });
};

export const createLoginUserRequest = (uid: string) => {
  return createRequest({ uri: `users/login/${uid}` });
};

export const createEditUserProfileRequest = (userId: number) => {
  return createRequest({
    uri: `users/${userId}`,
  });
};

export const createCreateCourseRequest = () => {
  return createRequest({
    uri: `courses`,
  });
};

export const createGetSearchedCoursesRequest = (
  searchQuery: string,
  onlyOwnCourses: boolean
) => {
  return createRequest({
    uri: `courses`,
    params: {
      search: searchQuery,
      own: onlyOwnCourses.toString(),
    },
  });
};

export const createGetCourseRequest = (courseId: number) => {
  return createRequest({
    uri: `courses/${courseId}`,
  });
};
