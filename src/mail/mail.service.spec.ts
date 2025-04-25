import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

describe('MailService', () => {
  let service: MailService;
  let mailerService: Partial<MailerService>;
  const OLD_ENV = process.env;

  beforeAll(() => {
    // Sao lưu biến môi trường và thiết lập APP_URL cho test
    process.env = { ...OLD_ENV, APP_URL: 'http://localhost:3000' };
  });

  afterAll(() => {
    // Phục hồi lại biến môi trường ban đầu
    process.env = OLD_ENV;
  });

  beforeEach(async () => {
    // Mock MailerService
    mailerService = {
      sendMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mailerService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  describe('sendConfirmation', () => {
    it('nên gọi mailer.sendMail với các tham số đúng', async () => {
      const to = 'user@example.com';
      const name = 'User';
      const token = 'abc123';
      const expectedUrl = `${process.env.APP_URL}/auth/confirm?token=${token}`;
      // Tạo buffer giả chứa HTML của email
      const fakeHtml = '<p>Email xác nhận</p>';
      const fakeBuffer = Buffer.from(fakeHtml, 'utf8');

      // Mock cả messageId và message (buffer) để kiểm tra nội dung HTML
      const mockInfo: Partial<SentMessageInfo> = {
        messageId: 'id-1',
        message: fakeBuffer,
      };
      (mailerService.sendMail as jest.Mock).mockResolvedValue(mockInfo);

      const result = await service.sendConfirmation(to, name, token);

      // Kiểm tra HTML email có chứa đúng nội dung từ template
      expect(result.message.toString()).toContain('Email xác nhận');

      // Kiểm tra mailer.sendMail được gọi với object chứa đúng cấu hình
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Xác nhận đăng ký tài khoản MyApp',
        template: 'confirm',
        context: { name, confirmUrl: expectedUrl },
      });
    });

    it('nên build đúng confirmUrl dựa trên APP_URL và token', async () => {
      const to = 'a@b.com';
      const name = 'Tester';
      const token = 'tokenXYZ';
      const fakeBuffer = Buffer.from('', 'utf8');
      (mailerService.sendMail as jest.Mock).mockResolvedValue({
        messageId: 'id-2',
        message: fakeBuffer,
      });

      await service.sendConfirmation(to, name, token);
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            name,
            confirmUrl: `${process.env.APP_URL}/auth/confirm?token=${token}`,
          },
        }),
      );
    });

    it('nên ném lỗi khi mailer.sendMail gặp sự cố', async () => {
      const error = new Error('Lỗi SMTP');
      (mailerService.sendMail as jest.Mock).mockRejectedValue(error);
      await expect(
        service.sendConfirmation('x@y.com', 'Z', 'tok'),
      ).rejects.toThrow('Lỗi SMTP');
    });
  });

  describe('sendWelcome', () => {
    it('nên gọi mailer.sendMail với template welcome và context đúng', async () => {
      const to = 'welcome@example.com';
      const context = { name: 'Guest', link: 'http://link.test' };
      const mockInfo: Partial<SentMessageInfo> = { messageId: 'id-3' };
      (mailerService.sendMail as jest.Mock).mockResolvedValue(mockInfo);

      const result = await service.sendWelcome(to, context);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Welcome!',
        template: 'welcome',
        context,
      });
      expect(result).toBe(mockInfo);
    });

    it('nên ném lỗi khi gửi welcome gặp sự cố', async () => {
      const err = new Error('SMTP fail');
      (mailerService.sendMail as jest.Mock).mockRejectedValue(err);
      await expect(
        service.sendWelcome('u@v.com', { name: 'A', link: '#' }),
      ).rejects.toThrow('SMTP fail');
    });
  });
});
