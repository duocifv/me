export class ApiError extends Error {
  status: number;
  type: string;

  constructor(message: string, status = 500, type = "ApiError") {
    super(message);
    this.status = status;
    this.type = type;
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
