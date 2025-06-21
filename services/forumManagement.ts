import {
  createForumAcceptAnswerRequest,
  createForumAnswerRequest,
  createForumQuestionRequest,
  createForumQuestionsRequest,
  createForumVoteAnswerRequest,
} from "@/api/forum";
import {
  ForumAnswer,
  ForumQuestion,
  ForumQuestionInformation,
  ForumAnswerInformation,
} from "@/types/forum";
import {
  getDateFromBackend,
  getFileFromBackend,
  handleError,
  postFile,
} from "./common";
import { forumAnswerSchema, forumQuestionSchema } from "@/validations/forum";
import axios from "axios";

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
          question.first_level_answers,
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
  questionId: number
): Promise<{ question: ForumQuestion; answers: ForumAnswer[] }> {
  try {
    const request = await createForumQuestionRequest(courseId, questionId);
    const response = await request.get("");
    const responseData = response.data.data;

    const answers = (responseData.thread || []).map(
      (answer: any) =>
        new ForumAnswer(
          answer.id,
          responseData.id,
          answer.parent_id,
          answer.user_id,
          getDateFromBackend(answer.created_at),
          answer.children_count,
          answer.upvotes,
          answer.downvotes,
          answer.vote,
          new ForumAnswerInformation(
            answer.content,
            getFileFromBackend(answer.file_name, answer.file_url)
          )
        )
    );

    const question = new ForumQuestion(
      responseData.id,
      responseData.user_id,
      getDateFromBackend(responseData.created_at),
      answers.length,
      new ForumQuestionInformation(
        responseData.title,
        responseData.description,
        responseData.tags,
        getFileFromBackend(responseData.file_name, responseData.file_url)
      ),
      responseData.accepted_answer_id
    );

    return { question, answers };
  } catch (error) {
    throw handleError(error, "obtener la pregunta del foro");
  }
}

export async function createForumQuestion(
  courseId: string,
  questionInformation: ForumQuestionInformation
): Promise<void> {
  try {
    forumQuestionSchema.parse(questionInformation);

    const request = await createForumQuestionsRequest(courseId);
    const body = {
      title: questionInformation.title,
      description: questionInformation.content,
      tags: questionInformation.tags,
    };

    if (questionInformation.file) {
      await postFile(request, questionInformation.file, body);
    } else {
      await request.post("", body);
    }
  } catch (error) {
    throw handleError(error, "crear la pregunta del foro");
  }
}

export async function editForumQuestion(
  courseId: string,
  questionId: number,
  questionInformation: ForumQuestionInformation
): Promise<void> {
  try {
    forumQuestionSchema.parse(questionInformation);
    const request = await createForumQuestionRequest(courseId, questionId);
    const body = {
      title: questionInformation.title,
      description: questionInformation.content,
      tags: questionInformation.tags,
    };
    console.log("courseId", courseId);
    console.log("questionId", questionId);
    console.log("body", body);
    await request.patch("", body);

    // TODO: Handlear actualización del archivo
    // if (questionInformation.file) {
    //   await postFile(request, questionInformation.file, body);
    // } else {
    //   await request.patch("", body);
    // }
  } catch (error) {
    throw handleError(error, "editar la pregunta del foro");
  }
}

export async function removeForumQuestion(
  courseId: string,
  questionId: number
): Promise<void> {
  try {
    const request = await createForumQuestionRequest(courseId, questionId);
    await request.delete("");
  } catch (error) {
    throw handleError(error, "editar la pregunta del foro");
  }
}

export async function createForumAnswer(
  courseId: string,
  questionId: number,
  parentAnswerId: number | null,
  answerInformation: ForumAnswerInformation
): Promise<void> {
  try {
    forumAnswerSchema.parse(answerInformation);

    const request = await createForumAnswerRequest(courseId, questionId);
    const body = {
      content: answerInformation.content,
      parent_id: parentAnswerId ? parentAnswerId.toString() : null, // TODO: pedir al back que lo cambien a un number
    };

    if (answerInformation.file) {
      await postFile(request, answerInformation.file, body);
    } else {
      await request.post("", body);
    }
  } catch (error) {
    throw handleError(error, "crear la respuesta en el foro");
  }
}

export async function voteAnswer(
  courseId: string,
  answerId: number,
  vote: 0 | 1 | -1
): Promise<void> {
  try {
    const request = await createForumVoteAnswerRequest(
      courseId,
      answerId,
      vote
    );
    await request.post(``);
  } catch (error) {
    throw handleError(error, "votar la respuesta en el foro");
  }
}

export async function acceptAnswer(
  courseId: string,
  questionId: number,
  answerId: number
): Promise<void> {
  try {
    const request = await createForumAcceptAnswerRequest(
      courseId,
      questionId,
      answerId
    );
    await request.post(``);
  } catch (error) {
    throw handleError(error, "aceptar la respuesta en el foro");
  }
}
