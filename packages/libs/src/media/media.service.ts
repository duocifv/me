import { api } from "../share/api/apiClient";
import { MediaFileDto } from "./dto/media-file.dto";
import { PaginatedMediaResponse } from "./dto/media-pagination";
import { FileType } from "./dto/media-upload.dto";

class MediaService {
  private media = api.group("media");

  // async findOne(id: string): Promise<MediaFileDto> {
  //   return this.media.get<MediaFileDto>(`${id}`);
  // }

  async findAll(): Promise<PaginatedMediaResponse> {
    return this.media.get<PaginatedMediaResponse>("");
  }

  async upload(file: FileType): Promise<MediaFileDto> {
    const formData = new FormData();
    formData.append("files", file);
    return await this.media.post<MediaFileDto>(`upload`, formData);
  }
}

export const mediaService = new MediaService();
