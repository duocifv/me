import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
    Request,
    Req,
    Res,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { HydroponicsService } from './hydroponics.service';
import { BodySchema } from 'src/shared/decorators/body-schema.decorator';
import { CreateCropInstanceDto, CreateCropInstanceSchema } from '../dto/create-crop-instance.dto';
import { CreateSnapshotDto, CreateSnapshotSchema } from '../dto/create-snapshot.dto';
import { DeviceTokenGuard } from '../guard/device-token.guard';
import { Public } from 'src/shared/decorators/public.decorator';
import { DeviceToken } from 'src/shared/decorators/device-token.decorator';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UploadFileDto } from '../dto/upload-file.dto';

@Public()
@DeviceToken()
@UseGuards(DeviceTokenGuard)
@Controller()
export class HydroponicsController {
    constructor(private readonly service: HydroponicsService) { }

    @Post('crop-instances')
    createCrop(
        @BodySchema(CreateCropInstanceSchema) dto: CreateCropInstanceDto,
        @Request() req,
    ) {
        return this.service.createCropInstance(req.deviceId, dto);
    }

    @Get('crop-instances')
    getCrops(@Request() req) {
        return this.service.getCropInstances(req.deviceId);
    }

    @Post('crop-instances/:id/snapshots')
    createSnapshot(
        @Param('id') cropId: number,
        @BodySchema(CreateSnapshotSchema) dto: CreateSnapshotDto,
    ) {
        return this.service.createSnapshot(cropId, dto);
    }

    @Get('crop-instances/:id/snapshots')
    getSnapshots(@Param('id') cropId: number) {
        return this.service.getSnapshots(cropId);
    }

    @Get('snapshots/:snapshotId')
    getSnapshot(@Param('snapshotId') snapshotId: number) {
        return this.service.getSnapshotById(snapshotId);
    }

    @ApiOperation({ summary: 'Upload ảnh' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadFileDto })
    @Post('snapshots/:snapshotId/images')
    async uploadEsp32(
        @Param('snapshotId') snapshotId: number,
        @Req() req: FastifyRequest,
        @Res({ passthrough: true }) res: FastifyReply,
    ) {
        if (!req.isMultipart()) {
            throw new BadRequestException('Form must be multipart/form-data');
        }
        const part = await req.file();

        if (!part) throw new NotFoundException('File không có');

        if (!['image/jpeg', 'image/png'].includes(part.mimetype)) {
            throw new BadRequestException('Chỉ JPG hoặc PNG được phép cho ESP32');
        }
        const { url } = await req.server.fileManager.saveEsp32Image(part);
        return this.service.uploadImage(snapshotId, url);
    }

}
