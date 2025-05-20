import { AxiosInstance } from "axios";
import { ZodError } from "zod";
import { File } from "@/types/file";
import Blob from "react-native/Libraries/Blob/Blob";
import {
  ExamItem,
  ExamItemType,
  OpenQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  MultipleSelectQuestion,
} from "@/types/activity";

export function handleError(error: any, action: string): Error {
  if (error instanceof ZodError) {
    return new Error(
      `Error de validacion al ${action}: ${error.errors[0].message}`
    );
  }
  return new Error(`Error al ${action}: ${error}`);
}

export function postFile(
  axiosInstance: AxiosInstance,
  uri: string,
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.localUri,
    name: file.name,
    type: file.type,
  } as any);

  return axiosInstance.post(uri, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function examItemToJSON(examItem: ExamItem) {
  switch (examItem.type) {
    case ExamItemType.OPEN:
      return {
        question: examItem.question,
        type: examItem.type,
        answer: (examItem as OpenQuestion).suggestedAnswer,
      };
    case ExamItemType.MULTIPLE_CHOICE:
      return {
        question: examItem.question,
        type: examItem.type,
        options: (examItem as MultipleChoiceQuestion).options,
        answer: (examItem as MultipleChoiceQuestion).correctAnswer,
      };
    case ExamItemType.TRUE_FALSE:
      return {
        question: examItem.question,
        type: examItem.type,
        answer: (examItem as TrueFalseQuestion).correctAnswer,
      };
    case ExamItemType.MULTIPLE_SELECT:
      return {
        question: examItem.question,
        type: examItem.type,
        options: (examItem as MultipleSelectQuestion).options,
        answers: (examItem as MultipleSelectQuestion).correctAnswers,
      };
    default:
      throw new Error("Tipo de pregunta no soportado");
  }
}

export function getExamItemFromJSON(examItemJSON: any): ExamItem {
  switch (examItemJSON.type) {
    case ExamItemType.OPEN:
      return new OpenQuestion(examItemJSON.question, examItemJSON.answer || "");
    case ExamItemType.MULTIPLE_CHOICE:
      return new MultipleChoiceQuestion(
        examItemJSON.question,
        examItemJSON.options,
        examItemJSON.answer
      );
    case ExamItemType.TRUE_FALSE:
      return new TrueFalseQuestion(examItemJSON.question, examItemJSON.answer);
    case ExamItemType.MULTIPLE_SELECT:
      return new MultipleSelectQuestion(
        examItemJSON.question,
        examItemJSON.options,
        examItemJSON.answers
      );
    default:
      throw new Error("Tipo de pregunta no soportado");
  }
}
