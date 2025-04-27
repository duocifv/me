
// src/common/validation/validation.controller.ts
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ValidationService } from './validation.service';

class SampleDto {
  // define sample properties for demonstration
}

@Controller('validation')
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post()
  @UsePipes(ValidationService)
  validateSample(@Body() dto: SampleDto) {
    return { message: 'Validation passed', data: dto };
  }
}
