import { useState, useEffect } from "react";
import { Searchbar, useTheme } from "react-native-paper";

interface SearchBarProps {
  placeholder: string;
  onSearch: (searchTerm: string) => void;
}

const SECONDS_TO_DEBOUNCE = 1;
const MILISECONDS_TO_DEBOUNCE = SECONDS_TO_DEBOUNCE * 1000;

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  onSearch,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, MILISECONDS_TO_DEBOUNCE);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return (
    <Searchbar
      placeholder={placeholder}
      onChangeText={setSearchTerm}
      value={searchTerm}
      clearIcon="close-circle"
      onClearIconPress={() => {
        setSearchTerm("");
        // onSearch("");
      }}
      onIconPress={() => {
        onSearch(searchTerm);
      }}
      onSubmitEditing={() => {
        onSearch(searchTerm);
      }}
      style={{ backgroundColor: theme.colors.surface }}
    />
  );
};
