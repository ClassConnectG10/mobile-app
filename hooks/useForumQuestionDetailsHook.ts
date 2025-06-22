import { useState } from "react";
import { File } from "@/types/file";
import { ForumQuestionInformation } from "@/types/forum";

export interface ForumQuestionInformationHook {
  forumQuestionInformation: ForumQuestionInformation;
  setForumQuestionInformation: (
    forumQuestionInformation: ForumQuestionInformation
  ) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setTags: (tags: string[]) => void;
  setFile: (file: File) => void;
}

export function useForumQuestionInformation(): ForumQuestionInformationHook {
  const [forumQuestionInformation, setForumQuestionInformation] =
    useState<ForumQuestionInformation>({
      title: "",
      content: "",
      tags: [],
      file: null,
    });

  const setTitle = (title: string) => {
    setForumQuestionInformation((prev) => ({ ...prev, title }));
  };

  const setContent = (content: string) => {
    setForumQuestionInformation((prev) => ({ ...prev, content }));
  };

  const setTags = (tags: string[]) => {
    setForumQuestionInformation((prev) => ({ ...prev, tags }));
  };

  const setFile = (file: File) => {
    setForumQuestionInformation((prev) => ({ ...prev, file }));
  };

  return {
    forumQuestionInformation,
    setForumQuestionInformation,
    setTitle,
    setContent,
    setTags,
    setFile,
  };
}
