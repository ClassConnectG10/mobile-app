import { TaskGrade } from "@/types/activity";
import { useState } from "react";

export interface TaskGradeHook {
  taskGrade: TaskGrade;
  setTaskGrade: (taskGrade: TaskGrade) => void;
  setMark: (mark: number) => void;
  setFeedbackMessage: (feedback: string) => void;
}

export function useTaskGrade(): TaskGradeHook {
  const [taskGrade, setTaskGrade] = useState<TaskGrade>(
    new TaskGrade(0, 0, 0, "")
  );

  const setMark = (mark: number) => {
    if (taskGrade) {
      setTaskGrade({ ...taskGrade, mark });
    }
  };

  const setFeedbackMessage = (feedbackMesage: string) => {
    if (taskGrade) {
      setTaskGrade({ ...taskGrade, feedback_message: feedbackMesage });
    }
  };

  return {
    taskGrade,
    setTaskGrade,
    setMark,
    setFeedbackMessage: setFeedbackMessage,
  };
}
