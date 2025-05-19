import { TaskDetails } from "@/types/activity";
import { useState } from "react";

export interface TaskDetailsHook {
  activityDetails: TaskDetails;
  setActivityDetails: (activityDetails: TaskDetails) => void;
  setTitle: (title: string) => void;
  setInstructions: (instruction: string) => void;
  setDueDate: (dueDate: Date) => void;
}

export function useTaskDetails(): TaskDetailsHook {
  const [activityDetails, setActivityDetails] = useState(
    new TaskDetails("", "", null)
  );

  const setTitle = (title: string) => {
    setActivityDetails((prev) => ({ ...prev, title }));
  };

  const setInstructions = (instructions: string) => {
    setActivityDetails((prev) => ({ ...prev, instructions }));
  };

  const setDueDate = (dueDate: Date) => {
    setActivityDetails((prev) => ({ ...prev, dueDate }));
  };

  return {
    activityDetails,
    setActivityDetails,
    setTitle,
    setInstructions,
    setDueDate,
  };
}
