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
