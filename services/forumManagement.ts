import {
  createForumQuestionRequest,
  createForumQuestionsRequest,
} from "@/api/forum";
import {
  ForumAnswer,
  ForumQuestion,
  ForumQuestionInformation,
  ForumAnswerInformation,
} from "@/types/forum";
import {
  getAttachmentFromBackend,
  getDateFromBackend,
  getFileFromBackend,
  handleError,
} from "./common";

export async function getQuestions(
  courseId: string
  // TODO: Questions filters
): Promise<ForumQuestion[]> {
  try {
    const request = await createForumQuestionsRequest(courseId);
    const response = await request.get("");
    const responseData = response.data.data;

    return responseData.map(
      (question: any) =>
        new ForumQuestion(
          question.id,
          question.user_id,
          getDateFromBackend(question.created_at),
          new ForumQuestionInformation(
            question.title,
            question.description,
            question.tags,
            getFileFromBackend(question.file_name, question.file_url)
          ),
          question.accepted_answer_id
        )
    );
  } catch (error) {
    throw handleError(error, "obtener los módulos del curso");
  }
}

export async function getQuestion(
  courseId: string,
  questionId: string
): Promise<{ question: ForumQuestion; answers: ForumAnswer[] }> {
  try {
    const request = await createForumQuestionRequest(courseId, questionId);
    const response = await request.get("");
    const responseData = response.data.data;

    const question = new ForumQuestion(
      responseData.id,
      responseData.user_id,
      getDateFromBackend(responseData.created_at),
      new ForumQuestionInformation(
        responseData.title,
        responseData.description,
        responseData.tags,
        getFileFromBackend(responseData.file_name, responseData.file_url)
      ),
      responseData.accepted_answer_id
    );

    const answers = (responseData.thread || []).map(
      (answer: any) =>
        new ForumAnswer(
          answer.id,
          question.id,
          answer.parent_id,
          answer.user_id,
          getDateFromBackend(answer.created_at),
          new ForumAnswerInformation(
            answer.content,
            getFileFromBackend(answer.file_name, answer.file_url)
          ),
          answer.upvotes,
          answer.downvotes
        )
    );

    return { question, answers };
  } catch (error) {
    throw handleError(error, "obtener la pregunta del foro");
  }
}
