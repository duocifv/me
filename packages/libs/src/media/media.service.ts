import { api } from "../share/api/apiClient";
import { MediaFileDto } from "./dto/media-file.dto";
import { PaginatedMediaResponse } from "./dto/media-pagination";

class MediaService {
  private media = api.group("media");

  async findAll(): Promise<PaginatedMediaResponse> {
    return this.media.get<PaginatedMediaResponse>("");
  }

  async findOne(id: string): Promise<MediaFileDto> {
    return this.media.get<MediaFileDto>(`${id}`);
  }
}

export const mediaService = new MediaService();
