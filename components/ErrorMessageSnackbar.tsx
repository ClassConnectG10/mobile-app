import React from "react";
import { View } from "react-native";
import { Snackbar } from "react-native-paper";

interface ErrorMessageSnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

/**
 *  General purpose snackbar to show error messages
 */
const ErrorMessageSnackbar: React.FC<ErrorMessageSnackbarProps> = ({
  visible,
  message,
  onDismiss,
}) => {
  return (
    <View>
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        action={{
          label: "OK",
          onPress: onDismiss,
        }}
      >
        {message}
      </Snackbar>
    </View>
  );
};

export default ErrorMessageSnackbar;
