interface FirebaseError {
  code?: string;
  message?: string;
}

export default function getErrorMessage(error: string | FirebaseError): string {
  const errorCode = typeof error === "string" ? error : error.code || "";
  const errorMessages: Record<string, string> = {
    "auth/invalid-credential": "The provided credentials are incorrect.",
    "auth/user-not-found": "No account exists with these credentials.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Your password is too weak. Please use a stronger one.",
    "auth/invalid-email": "The email address is not valid.",
  };

  return errorMessages[errorCode] || "An unexpected error occurred. Please try again.";
}
