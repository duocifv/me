import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('device_schedules')
export class DeviceScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceId: string;

  @Column({ default: false })
  pumpOn: boolean;

  @Column({ default: false })
  fanOn: boolean;

  @Column({ default: false })
  ledOn: boolean;

  @Column()
  startTime: string; // "HH:mm"

  @Column()
  endTime: string; // "HH:mm"

  /**
   * Dạng mảng lưu các ngày lặp lại: [0, 1, 2, 3, 4, 5, 6] (CN -> T7)
   * Ví dụ: [1,3,5] nghĩa là chạy vào thứ 2, 4, 6
   */
  @Column('simple-array', { default: '0,1,2,3,4,5,6' })
  repeatOn: number[]; // 0 = CN, 1 = T2, ..., 6 = T7

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
