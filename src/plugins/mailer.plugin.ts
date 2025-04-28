import fp from 'fastify-plugin';
import fastifyMailer from 'fastify-mailer';
import path from 'path';
import pug from 'pug';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SendMailOptions, SentMessageInfo } from 'nodemailer';
import { UnauthorizedException } from '@nestjs/common';

declare module 'fastify' {
  interface FastifyInstance {
    mailer: {
      sendMail: (opts: SendMailOptions) => Promise<SentMessageInfo>;
    };
  }
  interface FastifyRequest {
    /** chỉ đọc body và trả về payload mail */
    getMail(): SendMailOptions;
  }
  interface FastifyReply {
    /** gửi mail */
    sendMail(opts: SendMailOptions): Promise<{ sussecs: string }>;
  }
}

const mailOptionsSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  template: z.string(),
  context: z.record(z.any()).optional(),
  text: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});

// JSON Schema cho Swagger nếu cần
const TemplateMailOptionsJson = zodToJsonSchema(mailOptionsSchema, {
  $refStrategy: 'none',
});

export default fp<FastifyInstance>(async (app) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
    MAIL_TEMPLATE_PATH,
  } = process.env;
  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !MAIL_FROM ||
    !MAIL_TEMPLATE_PATH
  ) {
    throw new Error('Missing SMTP config in environment variables');
  }

  // 1. register mailer
  await app.register(fastifyMailer, {
    transport: {
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      jsonTransport: true,
    },
    defaults: { from: `"No Reply" <${MAIL_FROM}>` },
  });

  // 2. nếu bạn muốn expose schema cho Swagger
  app.addSchema({
    $id: 'TemplateMailOptions',
    ...TemplateMailOptionsJson,
  });

  // 3. decorateRequest để preview payload mail
  app.decorateRequest(
    'getMail',
    function (this: FastifyRequest): SendMailOptions {
      // parse và validate this.body
      const parsed = mailOptionsSchema.parse((this as any).body);
      const { to, subject, template, context, text, attachments } = parsed;
      const tplPath = path.join(MAIL_TEMPLATE_PATH, `${template}.pug`);
      const html = pug.renderFile(tplPath, context || {});
      return { to, subject, html, text, attachments };
    },
  );

  // 4. decorateReply để thực sự gửi mail
  app.decorateReply(
    'sendMail',
    async function (
      this: FastifyReply,
      opts: SendMailOptions,
    ): Promise<{ sussecs: string }> {
      const parsed = mailOptionsSchema.parse(opts);
      const { to, subject, template, context, text, attachments } = parsed;
      const tplPath = path.join(MAIL_TEMPLATE_PATH, `${template}.pug`);
      const html = pug.renderFile(tplPath, context || {});
      try {
        await this.server.mailer.sendMail({
          to,
          subject,
          text,
          html,
          attachments,
        });
        return { sussecs: 'đã gửi mail thành công' };
      } catch {
        throw new UnauthorizedException('Invalid refresh token signature');
      }
    },
  );
});
