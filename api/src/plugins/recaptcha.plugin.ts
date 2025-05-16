import axios from 'axios';

interface RecaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export const recaptchaPlugin = (app) => {
  const secretKey = process.env.RECAPTCHA_SECRET;
  if (!secretKey) {
    throw new Error('RECAPTCHA_SECRET is not defined in environment variables');
  }

  app.decorateRequest(
    'verifyRecaptcha',
    async function (): Promise<RecaptchaVerifyResponse> {
      const token =
        this.body?.captchaToken || this.headers['x-recaptcha-token'];
      if (!token || typeof token !== 'string') {
        throw new Error('Missing recaptcha token');
      }

      try {
        const { data } = await axios.post<RecaptchaVerifyResponse>(
          'https://www.google.com/recaptcha/api/siteverify',
          new URLSearchParams({
            secret: secretKey,
            response: token,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        if (!data.success) {
          throw new Error('Recaptcha verification failed');
        }

        return data;
      } catch (error: any) {
        throw new Error(`Recaptcha verification error: ${error.message}`);
      }
    },
  );
};

export default async function (app) {
  await app.register(recaptchaPlugin);
}
