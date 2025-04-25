import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './media.controller';
import { FastifyRequest, FastifyReply } from 'fastify';
import { pipeline } from 'node:stream/promises';
import { NotFoundException } from '@nestjs/common';

// Mock pipeline để kiểm tra xem có được gọi đúng hay không
jest.mock('node:stream/promises', () => ({
  pipeline: jest.fn(),
}));

describe('FileController', () => {
  let controller: FileController;
  let fileManager: any;
  let req: Partial<FastifyRequest>;
  let res: Partial<FastifyReply>;

  beforeEach(async () => {
    // Tạo mock fileManager với các method cần thiết
    fileManager = {
      saveFile: jest.fn(),
      listFiles: jest.fn().mockReturnValue(['a.jpg', 'b.png']),
      getStream: jest.fn().mockReturnValue('dummyStream'),
      deleteFile: jest.fn().mockReturnValue({ deleted: 'Xóa thành công' }),
    };

    // Mock request chứa files() trả về AsyncIterable
    req = {
      files: jest.fn().mockReturnValue(
        (async function* () {
          yield 'filePart';
        })(),
      ),
      server: { fileManager },
    } as any;

    // Mock response với header và raw
    res = {
      header: jest.fn().mockReturnThis(),
      raw: {},
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
    }).compile();

    controller = module.get<FileController>(FileController);
  });

  describe('upload', () => {
    it('nên lưu file và trả về thông báo thành công', async () => {
      const result = await controller.upload(req as FastifyRequest);
      expect(fileManager.saveFile).toHaveBeenCalledWith('filePart');
      expect(result).toEqual({ message: 'Upload thành công' });
    });
  });

  describe('list', () => {
    it('nên trả về danh sách files từ fileManager', () => {
      const result = controller.list(req as FastifyRequest);
      expect(fileManager.listFiles).toHaveBeenCalled();
      expect(result).toEqual({ files: ['a.jpg', 'b.png'] });
    });
  });

  describe('download', () => {
    it('nên gửi header attachment và pipe stream', async () => {
      await controller.download(
        'file.txt',
        res as FastifyReply,
        req as FastifyRequest,
      );
      expect(res.header).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent('file.txt')}"`,
      );
      expect(pipeline).toHaveBeenCalledWith(
        'dummyStream',
        (res as FastifyReply).raw,
      );
    });
  });

  describe('remove', () => {
    it('nên xóa file và trả về message', () => {
      const result = controller.remove('file.txt', req as FastifyRequest);
      expect(fileManager.deleteFile).toHaveBeenCalledWith('file.txt');
      expect(result).toEqual({ message: 'Xóa thành công' });
    });

    it('nên ném NotFoundException khi xóa thất bại', () => {
      fileManager.deleteFile.mockImplementation(() => {
        throw new Error();
      });
      expect(() =>
        controller.remove('file.txt', req as FastifyRequest),
      ).toThrow(NotFoundException);
    });
  });
});
