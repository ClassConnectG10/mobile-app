import { ExamGrade } from "@/types/activity";
import { useState } from "react";

export interface ExamGradeHook {
  examGrade: ExamGrade | null;
  setExamGrade: (ExamGrade: ExamGrade) => void;
  setExamId: (examId: number) => void;
  setStudentId: (studentId: number) => void;
  setMark: (mark: number) => void;
  setFeedbackMessage: (feedback: string) => void;
  setCorrectExamItems: (correctExamItems: boolean[]) => void;
}

export function useExamGrade(): ExamGradeHook {
  const [examGrade, setExamGrade] = useState<ExamGrade | null>(null);

  const setExamId = (examId: number) => {
    if (!examGrade) {
      return;
    }
    setExamGrade({ ...examGrade, resourceId: examId });
  };

  const setStudentId = (studentId: number) => {
    if (!examGrade) {
      return;
    }
    setExamGrade({ ...examGrade, studentId: studentId });
  };

  const setMark = (mark: number) => {
    if (!examGrade) {
      return;
    }
    setExamGrade({ ...examGrade, mark });
  };

  const setFeedbackMessage = (feedbackMesage: string) => {
    if (!examGrade) {
      return;
    }
    setExamGrade({ ...examGrade, feedback_message: feedbackMesage });
  };

  const setCorrectExamItems = (correctExamItems: boolean[]) => {
    if (!examGrade) {
      return;
    }
    setExamGrade({ ...examGrade, correctExamItems });
  };

  return {
    examGrade,
    setExamGrade,
    setExamId,
    setStudentId,
    setMark,
    setFeedbackMessage,
    setCorrectExamItems,
  };
}
