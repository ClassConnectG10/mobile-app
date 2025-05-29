import { ExamDetails } from "@/types/activity";
import { useState } from "react";

export interface ExamDetailsHook {
  examDetails: ExamDetails;
  setModuleId: (moduleId: number) => void;
  setExamDetails: (examDetails: ExamDetails) => void;
  setTitle: (title: string) => void;
  setInstructions: (instructions: string) => void;
  setExamItems: (examItems: any[]) => void;
  setDueDate: (dueDate: Date) => void;
}

export function useExamDetails(): ExamDetailsHook {
  const [examDetails, setExamDetails] = useState(
    new ExamDetails(null, "", "", [], null)
  );

  const setModuleId = (moduleId: number) => {
    setExamDetails((prev) => ({ ...prev, moduleId }));
  };

  const setTitle = (title: string) => {
    setExamDetails((prev) => ({ ...prev, title }));
  };

  const setInstructions = (instructions: string) => {
    setExamDetails((prev) => ({ ...prev, instructions }));
  };

  const setExamItems = (examItems: any[]) => {
    setExamDetails((prev) => ({ ...prev, examItems }));
  };

  const setDueDate = (dueDate: Date) => {
    setExamDetails((prev) => ({ ...prev, dueDate }));
  };

  return {
    examDetails,
    setModuleId,
    setExamDetails,
    setTitle,
    setInstructions,
    setExamItems,
    setDueDate,
  };
}
