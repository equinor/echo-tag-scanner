export interface EchoCameraError {
  // Determines if the error is displayed as a dialogue or a toast.
  severity: 'low' | 'high';

  // A user friendly message.
  userMessage: string;

  // A nerdy detailed message.
  devMessage?: Error;

  // An optional callback when the user dismisses the error.
  dismissAction?: () => void;
}
