import { TextInput } from "react-native-paper";

const NUMBER_OF_LINES = 1000000;

interface TextFieldProps {
  label: string;
  value: any;
  style?: "default" | "white";
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  style = "default",
}) => {
  return style === "white" ? (
    <TextInput
      label={label}
      placeholder={""}
      editable={false}
      value={String(value)}
      multiline={true}
      // numberOfLines={NUMBER_OF_LINES}
      style={{
        backgroundColor: "#fff",
      }}
    />
  ) : (
    <TextInput
      label={label}
      placeholder={""}
      editable={false}
      value={String(value)}
      multiline={true}
      numberOfLines={NUMBER_OF_LINES}
    />
  );
};
