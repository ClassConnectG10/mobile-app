import axios, { AxiosInstance } from "axios";
import { getAuth } from "firebase/auth";
import { SearchOption } from "@/types/searchOption";
import { SearchFilters } from "@/types/searchFilters";
import { ActivitiesOption } from "@/types/activity";

const BASE_URL = process.env.EXPO_PUBLIC_MIDDLEEND_BASE_URL;

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

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
  return createRequest({ uri: "users" });
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
  searchFilters: SearchFilters,
  searchOption: SearchOption
) => {
  const params: Record<string, string> = {
    search_option: searchOption,
  };

  if (searchFilters.searchQuery && searchFilters.searchQuery !== "") {
    params.search_query = searchFilters.searchQuery;
  }

  if (searchFilters.startDate) {
    params.start_date = formatDate(searchFilters.startDate);
  }

  if (searchFilters.endDate) {
    params.end_date = formatDate(searchFilters.endDate);
  }

  if (searchFilters.modality && searchFilters.modality !== "") {
    params.modality = searchFilters.modality;
  }

  if (searchFilters.level && searchFilters.level !== "") {
    params.level = searchFilters.level;
  }

  if (searchFilters.category && searchFilters.category !== "") {
    params.category = searchFilters.category;
  }

  return createRequest({
    uri: `courses`,
    params,
  });
};

export const createCourseRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}`,
  });
};

export const createCourseActivityRequest = (
  courseId: string,
  activityId: string
) => {
  return createRequest({
    uri: `courses/${courseId}/activity/${activityId}`,
  });
};

export const creatCourseActivitiesRequest = (
  courseId: string,
  activityType: ActivitiesOption
) => {
  const params: Record<string, string> =
    activityType !== ActivitiesOption.ALL
      ? { activity_type: activityType }
      : {};

  return createRequest({
    uri: `courses/${courseId}/activity`,
    params: params,
  });
};

export const creatCourseTaskRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/task`,
  });
};

export const creatCourseExamRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/exam`,
  });
};

export const createEnrollCourseRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/regist`,
  });
};

export const createStudentActivityRequest = (
  courseId: string,
  activityId: string
) => {
  return createRequest({
    uri: `courses/${courseId}/activity/${activityId}`,
  });
};

export const createModuleRequest = (courseId: string) => {
  return createRequest({
    uri: `courses/${courseId}/module`,
  });
};
