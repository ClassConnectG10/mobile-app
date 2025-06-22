import { ForumOrderBy, ForumSearchParams } from "@/types/forum";
import { useState } from "react";

export interface SearchFiltersHook {
  forumSearchParams: ForumSearchParams;
  setForumSearchParams: (forumSearchParams: ForumSearchParams) => void;
  setSearchQuery: (searchQuery: string) => void;
  setStartDate: (startDate: Date | null) => void;
  setEndDate: (endDate: Date | null) => void;
  setTags: (tags: string[]) => void;
  setOrderBy: (orderBy: ForumOrderBy) => void;
  resetFilters: () => void;
}

export function useForumSearchParams(): SearchFiltersHook {
  const [forumSearchParams, setForumSearchParams] = useState(
    new ForumSearchParams("", null, null, [], ForumOrderBy.RECENT)
  );

  const setSearchQuery = (searchQuery: string) => {
    setForumSearchParams((prev) => ({ ...prev, searchQuery }));
  };
  const setStartDate = (startDate: Date | null) => {
    setForumSearchParams((prev) => ({ ...prev, startDate }));
  };
  const setEndDate = (endDate: Date | null) => {
    setForumSearchParams((prev) => ({ ...prev, endDate }));
  };
  const setTags = (tags: string[]) => {
    setForumSearchParams((prev) => ({ ...prev, tags }));
  };
  const setOrderBy = (orderBy: ForumOrderBy) => {
    setForumSearchParams((prev) => ({ ...prev, orderBy }));
  };
  const resetFilters = () => {
    setForumSearchParams(
      new ForumSearchParams("", null, null, [], ForumOrderBy.RECENT)
    );
  };

  return {
    forumSearchParams,
    setForumSearchParams,
    setSearchQuery,
    setStartDate,
    setEndDate,
    setTags,
    setOrderBy,
    resetFilters,
  };
}
