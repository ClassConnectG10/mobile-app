import CourseDetails from "@/types/courseDetails";
import { useState } from "react";
import {
  defaultCategory,
  defaultLevel,
  defaultModality,
} from "@/utils/constants/courseDetails";

export interface CourseDetailsHook {
  courseDetails: CourseDetails;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setNumberOfStudents: (numberOfStudents: number) => void;
  setStartDate: (startDate: Date) => void;
  setEndDate: (endDate: Date) => void;
  setLevel: (level: string) => void;
  setModality: (modality: string) => void;
  setCategory: (category: string) => void;
}

export function useCourseDetails(): CourseDetailsHook {
  const now = new Date();
  const nowPlusOneYear = new Date();
  nowPlusOneYear.setFullYear(now.getFullYear() + 1);

  const [courseDetails, setCourseDetails] = useState(
    new CourseDetails(
      "",
      "",
      1,
      now,
      nowPlusOneYear,
      defaultLevel,
      defaultModality,
      defaultCategory
    )
  );

  const setName = (name: string) => {
    setCourseDetails((prev) => ({ ...prev, name }));
  };
  const setDescription = (description: string) => {
    setCourseDetails((prev) => ({ ...prev, description }));
  };
  const setNumberOfStudents = (numberOfStudents: number) => {
    setCourseDetails((prev) => ({ ...prev, numberOfStudents }));
  };
  const setStartDate = (startDate: Date) => {
    setCourseDetails((prev) => ({ ...prev, startDate }));
  };
  const setEndDate = (endDate: Date) => {
    setCourseDetails((prev) => ({ ...prev, endDate }));
  };
  const setLevel = (level: string) => {
    setCourseDetails((prev) => ({ ...prev, level }));
  };

  const setModality = (modality: string) => {
    setCourseDetails((prev) => ({ ...prev, modality }));
  };
  const setCategory = (category: string) => {
    setCourseDetails((prev) => ({ ...prev, category }));
  };

  return {
    courseDetails,
    setName,
    setNumberOfStudents,
    setDescription,
    setStartDate,
    setEndDate,
    setLevel,
    setModality,
    setCategory,
  };
}
