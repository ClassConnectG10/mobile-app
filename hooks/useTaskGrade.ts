import { TaskGrade } from "@/types/activity";
import { useState } from "react";

export interface TaskGradeHook {
  taskGrade: TaskGrade;
  setTaskGrade: (taskGrade: TaskGrade) => void;
  setTaskId: (taskId: number) => void;
  setStudentId: (studentId: number) => void;
  setMark: (mark: number) => void;
  setFeedbackMessage: (feedback: string) => void;
}

export function useTaskGrade(): TaskGradeHook {
  const [taskGrade, setTaskGrade] = useState<TaskGrade>(
    new TaskGrade(0, 0, 0, "")
  );

  const setTaskId = (taskId: number) => {
    if (taskGrade) {
      setTaskGrade({ ...taskGrade, resourceId: taskId });
    }
  };

  const setStudentId = (studentId: number) => {
    if (taskGrade) {
      setTaskGrade({ ...taskGrade, studentId: studentId });
    }
  };

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
    setTaskId,
    setStudentId,
    setMark,
    setFeedbackMessage,
  };
}
