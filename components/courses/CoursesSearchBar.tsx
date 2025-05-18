import { useState } from "react";
import { Searchbar } from "react-native-paper";

interface CoursesSearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export const CoursesSearchBar: React.FC<CoursesSearchBarProps> = ({
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Searchbar
      placeholder="Buscar cursos"
      onChangeText={setSearchTerm}
      value={searchTerm}
      clearIcon="close-circle"
      onClearIconPress={() => {
        setSearchTerm("");
        onSearch("");
      }}
      onIconPress={() => {
        onSearch(searchTerm);
      }}
      onSubmitEditing={() => {
        onSearch(searchTerm);
      }}
    />
  );
};
