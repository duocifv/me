export class ValidationError extends Error {
  public statusCode: number;
  public errors: string[];

  constructor(zodError: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages = (zodError as any).errors?.map((e: any) => e.message) ?? [
      "Lỗi không xác định",
    ];
    super(messages.join(", "));
    this.name = "ZodValidationError";
    this.statusCode = 400;
    this.errors = messages;
  }
}
