import { SearchFilters } from "@/types/searchFilters";
import { useState } from "react";

export interface SearchFiltersHook {
  searchFilters: SearchFilters;
  setSearchFilters: (searchFilters: SearchFilters) => void;
  setSearchQuery: (searchQuery: string) => void;
  setStartDate: (startDate: Date | null) => void;
  setEndDate: (endDate: Date | null) => void;
  setLevel: (level: string) => void;
  setModality: (modality: string) => void;
  setCategory: (category: string) => void;
  resetSearchFilters: () => void;
}

export function useSearchFilters(): SearchFiltersHook {
  const [searchFilters, setSearchFilters] = useState(
    new SearchFilters("", null, null, "", "", "")
  );

  const setSearchQuery = (searchQuery: string) => {
    setSearchFilters((prev) => ({ ...prev, searchQuery }));
  };
  const setStartDate = (startDate: Date | null) => {
    setSearchFilters((prev) => ({ ...prev, startDate }));
  };
  const setEndDate = (endDate: Date | null) => {
    setSearchFilters((prev) => ({ ...prev, endDate }));
  };
  const setLevel = (level: string) => {
    setSearchFilters((prev) => ({ ...prev, level }));
  };
  const setModality = (modality: string) => {
    setSearchFilters((prev) => ({ ...prev, modality }));
  };
  const setCategory = (category: string) => {
    setSearchFilters((prev) => ({ ...prev, category }));
  };

  const resetSearchFilters = () => {
    setSearchFilters(new SearchFilters("", null, null, "", "", ""));
  };

  return {
    searchFilters,
    setSearchFilters,
    setSearchQuery,
    setStartDate,
    setEndDate,
    setLevel,
    setModality,
    setCategory,
    resetSearchFilters,
  };
}
