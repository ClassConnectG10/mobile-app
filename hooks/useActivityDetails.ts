import { ActivityDetails } from "@/types/activity";
import { useState } from "react";

export interface ActivityDetailsHook {
  activityDetails: ActivityDetails;
  setActivityDetails: (activityDetails: ActivityDetails) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setInstruction: (instruction: string) => void;
  setDueDate: (dueDate: Date) => void;
}

export function useActivityDetails(): ActivityDetailsHook {
  const [activityDetails, setActivityDetails] = useState(
    new ActivityDetails("", "", "", null),
  );

  const setTitle = (title: string) => {
    setActivityDetails((prev) => ({ ...prev, title }));
  };

  const setDescription = (description: string) => {
    setActivityDetails((prev) => ({ ...prev, description }));
  };

  const setInstruction = (instruction: string) => {
    setActivityDetails((prev) => ({ ...prev, instruction }));
  };

  const setDueDate = (dueDate: Date) => {
    setActivityDetails((prev) => ({ ...prev, dueDate }));
  };

  return {
    activityDetails,
    setActivityDetails,
    setTitle,
    setDescription,
    setInstruction,
    setDueDate,
  };
}
