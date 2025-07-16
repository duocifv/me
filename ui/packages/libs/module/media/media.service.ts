import { BulkDeleteDto, BulkDeleteSchema } from "../auth/dto/bulk-delete.dto";
import { IdParamDto } from "../roles/dto/Id-role.dto";
import { api } from "../share/api/apiClient";
import { ValidationError } from "../share/api/zod-error";
import { uuidDto, uuidSchema } from "../share/schema/uuid";
import { MediaFileDto } from "./dto/media-file.dto";
import { PaginatedMediaResponse } from "./dto/media-pagination";
import { FileType } from "./dto/media-upload.dto";

class MediaService {
  private media = api.group("media");

  async findAll(): Promise<MediaFileDto[]> {
    return this.media.get<MediaFileDto[]>("all");
  }

  async findPaginate(): Promise<PaginatedMediaResponse> {
    return this.media.get<PaginatedMediaResponse>("");
  }

  async upload(file: FileType): Promise<MediaFileDto> {
    const formData = new FormData();
    formData.append("files", file);
    return await this.media.post<MediaFileDto>(`upload`, formData);
  }

  async deleteOne(uuid: uuidDto): Promise<void> {
    const { data, success, error } = uuidSchema.safeParse(uuid);
    if (!success) {
      throw new ValidationError(error);
    }
    return this.media.delete<void>(data);
  }

  async deleteMany(dto: BulkDeleteDto): Promise<void | string> {
    const { data, success, error } = BulkDeleteSchema.safeParse(dto);
    if (!success) {
      throw new ValidationError(error);
    }
    return this.media.post<void>("delete-many", data);
  }

  async downloadFile(fileName: string): Promise<void> {
    try {
      const blob = await this.media.get<Blob>(
        `download/${fileName}`,
        {},
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi khi tải tệp:", error);
    }
  }
}

export const mediaService = new MediaService();
