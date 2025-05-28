import { useState } from "react";
import { Attachment, ResourceDetails } from "@/types/resources";

export interface UseResourceDetailsHook {
  resourceDetails: ResourceDetails;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setAttachments: (attachments: Attachment[]) => void;
  setResourceDetails: (details: ResourceDetails) => void;
}

export function useResourceDetails(): UseResourceDetailsHook {
  const [resourceDetails, setResourceDetails] = useState<ResourceDetails>({
    title: "",
    description: "",
    moduleId: 0,
    attachments: [],
  });

  const setTitle = (title: string) =>
    setResourceDetails((prev) => ({ ...prev, title }));
  const setDescription = (description: string) =>
    setResourceDetails((prev) => ({ ...prev, description }));
  const setAttachments = (attachments: Attachment[]) =>
    setResourceDetails((prev) => ({ ...prev, attachments }));

  return {
    resourceDetails,
    setTitle,
    setDescription,
    setAttachments,
    setResourceDetails,
  };
}
