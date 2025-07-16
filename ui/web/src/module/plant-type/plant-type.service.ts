import { api } from "../share/api/apiClient";
import { CreatePlantTypeDto } from "./dto/create-plant-type.dto";
import { PlantTypeDto } from "./dto/plant-type-list.dto";
import { UpdatePlantTypeDto } from "./dto/update-plant-type.dto";

class PlantTypeService {
  private plantType = api.group("plant-types");

  async getAll(): Promise<PlantTypeDto[]> {
    return await this.plantType.get<PlantTypeDto[]>();
  }

  async getById(id: string): Promise<PlantTypeDto> {
    return this.plantType.get<PlantTypeDto>(id);
  }

  async create(dto: CreatePlantTypeDto): Promise<PlantTypeDto> {
    return this.plantType.post<PlantTypeDto>("", dto);
  }

  async update(id: number, dto: UpdatePlantTypeDto): Promise<PlantTypeDto> {
    return this.plantType.put<PlantTypeDto>(`${id}`, dto);
  }

  async remove(id: number): Promise<void> {
    return this.plantType.delete<void>(`${id}`);
  }
}

export const plantTypeService = new PlantTypeService();
