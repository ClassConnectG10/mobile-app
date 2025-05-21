import { AxiosInstance } from "axios";
import { ZodError } from "zod";
import { File } from "@/types/file";
import {
  ExamItem,
  ExamItemType,
  OpenQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  MultipleSelectQuestion,
  SubmittedExamItem,
  OpenAnswer,
  MultipleChoiceAnswer,
  TrueFalseAnswer,
  MultipleSelectAnswer,
  ExamItemAnswer,
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
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.localUri,
    name: file.name,
    type: file.type,
  } as any);

  return axiosInstance.post("", formData, {
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

// TODO: Cambiar question por índice de question
export function submittedExamItemToJSON(submittedItem: SubmittedExamItem) {
  switch (submittedItem.type) {
    case ExamItemType.OPEN:
      return {
        question: "",
        type: submittedItem.type,
        answer: (submittedItem.answer as OpenAnswer).answer,
      };
    case ExamItemType.MULTIPLE_CHOICE:
      return {
        question: "",
        type: submittedItem.type,
        answer: (submittedItem.answer as MultipleChoiceAnswer).answer,
      };
    case ExamItemType.TRUE_FALSE:
      return {
        question: "",
        type: submittedItem.type,
        answer: (submittedItem.answer as TrueFalseAnswer).answer,
      };
    case ExamItemType.MULTIPLE_SELECT:
      return {
        question: "",
        type: submittedItem.type,
        answers: (submittedItem.answer as MultipleSelectAnswer).answers,
      };
    default:
      throw new Error("Tipo de respuesta no soportado");
  }
}

export function getExamAnswerFromJSON(
  examItem: ExamItem,
  index: number,
  responseData: any
): SubmittedExamItem {
  let examItemAnswer: ExamItemAnswer;
  let correct: boolean | null = null;
  const answer = responseData.answers?.[index] ?? null;

  switch (examItem.type) {
    case ExamItemType.OPEN:
      examItemAnswer = new OpenAnswer(answer?.answer ?? "");
      break;
    case ExamItemType.MULTIPLE_CHOICE:
      examItemAnswer = new MultipleChoiceAnswer(answer?.answer ?? null);
      if (
        answer?.answer !== null &&
        (examItem as MultipleChoiceQuestion).correctAnswer !== null
      ) {
        correct =
          (examItem as MultipleChoiceQuestion).correctAnswer === answer.answer;
      }
      break;
    case ExamItemType.MULTIPLE_SELECT:
      examItemAnswer = new MultipleSelectAnswer(answer?.answers ?? []);
      if (
        answer?.answers !== null &&
        (examItem as MultipleSelectQuestion).correctAnswers !== null
      ) {
        if (
          (examItem as MultipleSelectQuestion).correctAnswers.length !=
          answer?.answers.length
        ) {
          correct = false;
        } else {
          correct = (examItem as MultipleSelectQuestion).correctAnswers.every(
            (index) => answer?.answers.includes(index)
          );
        }
      }
      break;
    case ExamItemType.TRUE_FALSE:
      examItemAnswer = new TrueFalseAnswer(answer?.answer ?? null);
      if (
        answer?.answer !== null &&
        (examItem as TrueFalseQuestion).correctAnswer !== null
      ) {
        correct =
          answer.answer === (examItem as TrueFalseQuestion).correctAnswer;
      }
      break;
    default:
      throw new Error(`Unsupported exam item type: ${examItem.type}`);
  }

  const submittedExamItem = new SubmittedExamItem(
    index,
    examItem.type,
    examItemAnswer,
    correct
  );

  return submittedExamItem;
}

const STORAGE_FREFIX =
  "https://storage.googleapis.com/class-connect-g10.firebasestorage.app";

export function getFileFromBackend(fileName: string, backendRef: string): File {
  const firebaseRef = parseBackendRef(backendRef);
  const fileType = getFileTypeFromName(fileName);
  const file = new File(fileName, fileType, null, firebaseRef);
  return file;
}

function parseBackendRef(backendRef: string): string {
  const prefixLength = STORAGE_FREFIX.length;
  if (backendRef.length <= prefixLength) {
    throw new Error(
      `El backendRef no es válido. Debe comenzar con ${STORAGE_FREFIX}`
    );
  }
  const ref = backendRef.substring(prefixLength);
  return ref;
}

function getFileTypeFromName(fileName: string): string {
  const fileExtension = fileName.split(".").pop()?.toLowerCase();
  switch (fileExtension) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "txt":
      return "text/plain";
    case "zip":
      return "application/zip";
    case "rar":
      return "application/x-rar-compressed";
    case "7z":
      return "application/x-7z-compressed";
    case "tar":
      return "application/x-tar";
    case "gz":
    case "gzip":
      return "application/gzip";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "mp4":
      return "video/mp4";
    case "avi":
      return "video/x-msvideo";
    case "webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
}
