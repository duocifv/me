export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public name: string = "ApiError"
  ) {
    super(message);
    this.name = name;
  }
}

export interface ErrorRespose {
  message: string;
  errors?: zodValidation[] | string;
  statusCode: number;
}

export type zodValidation = {
  field: string;
  message: string;
};

type ErrorHandler = (err: unknown) => boolean;

class ErrorHandlerProvider {
  private handlers: ErrorHandler[] = [];

  register(handler: ErrorHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  handle(err: unknown): boolean {
    for (const handler of this.handlers) {
      if (handler(err)) return true;
    }
    return false;
  }
}

export const errorHandler = new ErrorHandlerProvider();
