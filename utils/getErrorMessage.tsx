export default function getErrorMessage(errorCode: string) {
  const errorMessages: Record<string, string> = {
    "auth/invalid-credential": "Invalid credentials",
    "auth/user-not-found": "User not found",
    "auth/too-many-requests": "Too many requests. Try again later",
    "auth/email-already-in-use": "Email is already in use",
    "auth/weak-password": "Password is too weak",
    "auth/invalid-email": "Invalid email",
  };
  return errorMessages[errorCode] || "An error occurred. Please try again";
}
