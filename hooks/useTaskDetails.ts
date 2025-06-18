import { TaskDetails } from "@/types/activity";
import { useState } from "react";
import { File } from "@/types/file";

export interface TaskDetailsHook {
  taskDetails: TaskDetails;
  setTaskDetails: (activityDetails: TaskDetails) => void;
  setModuleId: (moduleId: number) => void;
  setTitle: (title: string) => void;
  setInstructions: (instruction: string) => void;
  setInstructionsFile: (file: File) => void;
  setDueDate: (dueDate: Date) => void;
}

export function useTaskDetails(): TaskDetailsHook {
  const [taskDetails, setTaskDetails] = useState(
    new TaskDetails(null, "", "", null, null)
  );

  const setModuleId = (moduleId: number) => {
    setTaskDetails((prev) => ({ ...prev, moduleId }));
  };

  const setTitle = (title: string) => {
    setTaskDetails((prev) => ({ ...prev, title }));
  };

  const setInstructions = (instructions: string) => {
    setTaskDetails((prev) => ({ ...prev, instructions }));
  };

  const setDueDate = (dueDate: Date) => {
    setTaskDetails((prev) => ({ ...prev, dueDate }));
  };

  const setInstructionsFile = (file: File) => {
    setTaskDetails((prev) => ({ ...prev, instructionsFile: file }));
  };

  return {
    taskDetails,
    setTaskDetails,
    setModuleId,
    setTitle,
    setInstructions,
    setInstructionsFile,
    setDueDate,
  };
}
