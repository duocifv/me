// src/settings/settings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async getAllSettings(): Promise<Setting[]> {
    return this.settingsRepository.find();
  }

  async getSettingByKey(key: string): Promise<Setting> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async updateSetting(
    key: string,
    updateSettingDto: UpdateSettingDto,
  ): Promise<Setting> {
    const setting = await this.getSettingByKey(key);
    Object.assign(setting, updateSettingDto);
    return this.settingsRepository.save(setting);
  }

  async createSetting(createSettingDto: CreateSettingDto): Promise<Setting> {
    const setting = this.settingsRepository.create(createSettingDto);
    return this.settingsRepository.save(setting);
  }

  async removeSetting(key: string): Promise<void> {
    const setting = await this.getSettingByKey(key);
    await this.settingsRepository.remove(setting);
  }
}
