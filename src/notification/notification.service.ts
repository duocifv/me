import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private data = [];

  findAll() {
    return this.data;
  }

  findOne(id: number) {
    const item = this.data.find((d) => d.id === id);
    if (!item) throw new NotFoundException();
    return item;
  }

  create(payload: any) {
    const id = this.data.length + 1;
    const item = { id, ...payload };
    this.data.push(item);
    return item;
  }

  update(id: number, payload: any) {
    const idx = this.data.findIndex((d) => d.id === id);
    if (idx === -1) throw new NotFoundException();
    this.data[idx] = { id, ...payload };
    return this.data[idx];
  }

  remove(id: number) {
    const idx = this.data.findIndex((d) => d.id === id);
    if (idx === -1) throw new NotFoundException();
    const [removed] = this.data.splice(idx, 1);
    return removed;
  }
}
