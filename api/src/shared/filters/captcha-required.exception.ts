import { HttpException, HttpStatus } from '@nestjs/common';

export class CaptchaRequiredException extends HttpException {
  constructor() {
    super(
      {
        message: 'Vui lòng xác thực reCAPTCHA',
        code: 'CAPTCHA_REQUIRED',
        statusCode: 400,
      },
      HttpStatus.BAD_REQUEST, // 400
    );
  }
}

export class CaptchaInvalidException extends HttpException {
  constructor(message: string = 'reCAPTCHA không hợp lệ') {
    super(
      {
        message,
        code: 'INVALID_RECAPTCHA',
        statusCode: 400,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class CaptchaRequestFailedException extends HttpException {
  constructor(originalError: any) {
    super(
      {
        message: `Lỗi reCAPTCHA: ${originalError.message}`,
        code: 'RECAPTCHA_REQUEST_FAILED',
        statusCode: 400,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
