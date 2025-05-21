import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException('Notification not found');
    return item;
  }

  create(dto: CreateNotificationDto) {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateNotificationDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return this.repo.remove(item);
  }
}
