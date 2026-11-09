export type ActionResult<T = void> = {
  success: boolean;
  message: string;
  /** The mutation succeeded, but follow-up work needs attention. */
  warning?: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
};
