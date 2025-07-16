export class ValidationError extends Error {
  public statusCode: number;
  public errors: string[];

  constructor(zodError: import("zod").ZodError) {
    const messages = zodError.errors.map((e) => e.message);
    super(messages.join(", "));
    this.name = "ZodValidationError";
    this.statusCode = 400;
    this.errors = messages;
  }
}
