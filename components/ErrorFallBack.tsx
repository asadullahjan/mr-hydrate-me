import { ScrollView, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";

const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
    >
      <Text
        variant="titleMedium"
        style={styles.title}
      >
        Something went wrong
      </Text>
      <Text
        variant="bodyMedium"
        style={styles.message}
      >
        An unexpected error occurred. Please contact support if this persists.
      </Text>
      <Text
        variant="bodySmall"
        style={styles.errorDetails}
      >
        Error: {error.message}
      </Text>
      <Button
        mode="contained"
        onPress={resetError}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Try Again
      </Button>
      <Text
        variant="bodySmall"
        style={styles.support}
      >
        Support: support@example.com
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Allows content to grow within ScrollView
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  message: {
    marginBottom: 15,
    textAlign: "center",
  },
  errorDetails: {
    marginBottom: 20,
    color: "#666",
    textAlign: "center",
  },
  button: {
    marginVertical: 10,
  },
  buttonLabel: {
    color: "#fff",
  },
  support: {
    marginTop: 10,
    color: "#888",
  },
});

export default ErrorFallback;
