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
import {
  Attachment,
  FileAttachment,
  LinkAttachment,
  AttachmentType,
} from "@/types/resources";
import { Link } from "@/types/link";
import {
  createAttachmentRequest,
  createResourceFileUploadRequest,
  createResourceLinkUploadRequest,
} from "@/api/resources";

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

function createAnswerFromResponse(
  examItem: ExamItem,
  answer: any
): ExamItemAnswer {
  switch (examItem.type) {
    case ExamItemType.OPEN:
      return new OpenAnswer(answer?.answer ?? "");

    case ExamItemType.MULTIPLE_CHOICE:
      return new MultipleChoiceAnswer(answer?.answer ?? null);

    case ExamItemType.MULTIPLE_SELECT:
      return new MultipleSelectAnswer(answer?.answers ?? []);

    case ExamItemType.TRUE_FALSE:
      return new TrueFalseAnswer(answer?.answer ?? null);

    default:
      throw new Error(`Unsupported exam item type: ${examItem.type}`);
  }
}

function evaluateAnswerCorrectness(
  examItem: ExamItem,
  answer: any
): boolean | null {
  if (!answer) return null;

  switch (examItem.type) {
    case ExamItemType.MULTIPLE_CHOICE: {
      const correct = (examItem as MultipleChoiceQuestion).correctAnswer;
      return answer.answer !== null && correct !== null
        ? answer.answer === correct
        : null;
    }

    case ExamItemType.MULTIPLE_SELECT: {
      const correctAnswers = (examItem as MultipleSelectQuestion)
        .correctAnswers;
      const userAnswers = answer.answers;
      if (!userAnswers || correctAnswers === null) return null;
      if (userAnswers.length !== correctAnswers.length) return false;
      return correctAnswers.every((index) => userAnswers.includes(index));
    }

    case ExamItemType.TRUE_FALSE: {
      const correct = (examItem as TrueFalseQuestion).correctAnswer;
      return answer.answer !== null && correct !== null
        ? answer.answer === correct
        : null;
    }

    case ExamItemType.OPEN:
    default:
      return null; // No hay validación automática para respuestas abiertas u otros casos.
  }
}

export function getExamAnswerFromJSON(
  examItem: ExamItem,
  index: number,
  responseData: any
): SubmittedExamItem {
  const answer = responseData.answers?.[index] ?? null;

  const examItemAnswer = createAnswerFromResponse(examItem, answer);
  const correct = evaluateAnswerCorrectness(examItem, answer);

  return new SubmittedExamItem(index, examItem.type, examItemAnswer, correct);
}

const STORAGE_FREFIX =
  "https://storage.googleapis.com/class-connect-g10.firebasestorage.app";

export function getFileFromBackend(
  fileName: string,
  backendRef: string,
  frontendRef?: string
): File {
  if (!fileName || !backendRef) {
    // TODO: ver si está bien manejado el error
    return null;
  }
  const firebaseRef = parseBackendRef(backendRef);
  const fileType = getFileTypeFromName(fileName);
  const localUri = frontendRef || null;
  const file = new File(fileName, fileType, localUri, firebaseRef);
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

// Actualiza los adjuntos de un recurso, eliminando los que ya no están y subiendo los nuevos
// Los adjuntos finales quedarán actualizados en el arreglo `updatedAttachments`
export async function syncResourceAttachments(
  courseId: string,
  moduleId: number,
  resourceId: number,
  updatedAttachments: Attachment[],
  originalAttachments: Attachment[]
) {
  const originalAttachmentIds = originalAttachments.map(
    (att) => att.attachmentId
  );
  const updatedAttachmentIds = updatedAttachments.map(
    (att) => att.attachmentId
  );

  const attachmentsToDelete = originalAttachments.filter(
    (att) =>
      att.attachmentId && !updatedAttachmentIds.includes(att.attachmentId)
  );
  const attachmentsToCreate = updatedAttachments.filter(
    (att) => !originalAttachmentIds.includes(att.attachmentId)
  );

  // Eliminar los adjuntos que ya no están en el recurso
  await Promise.all(
    attachmentsToDelete.map(async (attachment) => {
      const attachmentRequest = await createAttachmentRequest(
        courseId,
        moduleId,
        resourceId,
        attachment.attachmentId
      );
      await attachmentRequest.delete("");
    })
  );

  const fileRequest = await createResourceFileUploadRequest(
    courseId,
    moduleId,
    resourceId
  );
  const linkRequest = await createResourceLinkUploadRequest(
    courseId,
    moduleId,
    resourceId
  );

  // Subir los nuevos adjuntos y actualizar el attachmentId en el arreglo original
  await Promise.all(
    attachmentsToCreate.map(async (attachment) => {
      if (attachment instanceof FileAttachment) {
        const response = await postFile(fileRequest, attachment.file);

        const newId = response?.data?.data?.attachment_id;
        const firebaseUrl = response?.data?.data?.url;
        if (newId && firebaseUrl) {
          attachment.attachmentId = newId;
          attachment.file = getFileFromBackend(
            attachment.file.name,
            firebaseUrl,
            attachment.file.localUri
          );
        }
      } else if (attachment instanceof LinkAttachment) {
        const response = await linkRequest.post("", {
          external_ref: attachment.link.display,
          url: attachment.link.url,
        });
        const newId = response?.data?.data?.attachment_id;
        if (newId) {
          attachment.attachmentId = newId;
        }
      }
    })
  );
}

export function getAttachmentFromBackend(attachmentData: any): Attachment {
  if (attachmentData.type === AttachmentType.FILE) {
    const file = getFileFromBackend(
      attachmentData.external_ref,
      attachmentData.url
    );
    return new FileAttachment(file, attachmentData.attachment_id);
  } else if (attachmentData.type === AttachmentType.LINK) {
    const link = new Link(attachmentData.external_ref, attachmentData.url);
    return new LinkAttachment(link, attachmentData.attachment_id);
  }

  throw new Error(`Tipo de adjunto no soportado: ${attachmentData.type}`);
}
