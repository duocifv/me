// src/settings/settings.controller.ts
import { Controller, Get, Put, Body, Param, Delete } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get(':key')
  getSettingByKey(@Param('key') key: string) {
    return this.settingsService.getSettingByKey(key);
  }

  @Put(':key')
  updateSetting(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingsService.updateSetting(key, updateSettingDto);
  }

  @Put()
  createSetting(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.createSetting(createSettingDto);
  }

  @Delete(':key')
  removeSetting(@Param('key') key: string) {
    return this.settingsService.removeSetting(key);
  }
}
