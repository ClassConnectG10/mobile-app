import { useState } from "react";
import { File } from "@/types/file";
import { ForumAnswerInformation } from "@/types/forum";

export interface ForumAnswerInformationHook {
  forumAnswerInformation: ForumAnswerInformation;
  setForumAnswerInformation: (
    forumAnswerInformation: ForumAnswerInformation
  ) => void;
  setContent: (content: string) => void;
  setFile: (file: File) => void;
}

export function useForumAnswerInformation(): ForumAnswerInformationHook {
  const [forumAnswerInformation, setForumAnswerInformation] =
    useState<ForumAnswerInformation>({
      content: "",
      file: null,
    });

  const setContent = (content: string) => {
    setForumAnswerInformation((prev) => ({ ...prev, content }));
  };

  const setFile = (file: File) => {
    setForumAnswerInformation((prev) => ({ ...prev, file }));
  };

  return {
    forumAnswerInformation: forumAnswerInformation,
    setForumAnswerInformation: setForumAnswerInformation,
    setContent,
    setFile,
  };
}
