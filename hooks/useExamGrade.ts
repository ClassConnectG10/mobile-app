import { ExamGrade } from "@/types/activity";
import { useState } from "react";

export interface ExamGradeHook {
  examGrade: ExamGrade;
  setExamGrade: (ExamGrade: ExamGrade) => void;
  setExamId: (examId: number) => void;
  setStudentId: (studentId: number) => void;
  setMark: (mark: number) => void;
  setFeedbackMessage: (feedback: string) => void;
  setCorrectExamItems: (correctExamItems: boolean[]) => void;
}

export function useExamGrade(): ExamGradeHook {
  const [examGrade, setExamGrade] = useState<ExamGrade>(
    new ExamGrade(0, 0, 0, "", [])
  );

  const setExamId = (examId: number) => {
    if (ExamGrade) {
      setExamGrade({ ...examGrade, resourceId: examId });
    }
  };

  const setStudentId = (studentId: number) => {
    if (ExamGrade) {
      setExamGrade({ ...examGrade, studentId: studentId });
    }
  };

  const setMark = (mark: number) => {
    if (ExamGrade) {
      setExamGrade({ ...examGrade, mark });
    }
  };

  const setFeedbackMessage = (feedbackMesage: string) => {
    if (ExamGrade) {
      setExamGrade({ ...examGrade, feedback_message: feedbackMesage });
    }
  };

  const setCorrectExamItems = (correctExamItems: boolean[]) => {
    if (ExamGrade) {
      setExamGrade({ ...examGrade, correctExamItems });
    }
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
