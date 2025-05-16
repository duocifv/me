import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AccountSecurityService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_TIME_MINUTES = 15;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Kiểm tra tài khoản có đang bị khóa không
   */
  isLocked(user: User): boolean {
    return !!user.lockedUntil && user.lockedUntil > new Date();
  }

  /**
   * Xử lý khi đăng nhập thất bại: tăng counter và khóa nếu vượt ngưỡng
   */
  async handleFailedLogin(user: User): Promise<void> {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(
        Date.now() + this.LOCK_TIME_MINUTES * 60 * 1000,
      );
      user.failedLoginAttempts = 0; // reset khi khóa
    }

    await this.userRepository.save(user);
  }

  /**
   * Reset lại counter khi đăng nhập thành công
   */
  async resetFailedLogin(user: User): Promise<void> {
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepository.save(user);
  }

  /**
   * Khóa tài khoản đến thời điểm `until`
   */
  async lockAccount(user: User, until: Date): Promise<void> {
    user.lockedUntil = until;
    user.failedLoginAttempts = 0;
    await this.userRepository.save(user);
  }

  /**
   * Mở khóa tài khoản ngay lập tức
   */
  async unlockAccount(user: User): Promise<void> {
    user.lockedUntil = null;
    user.failedLoginAttempts = 0;
    await this.userRepository.save(user);
  }
}
