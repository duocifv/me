import { Injectable } from '@nestjs/common';
 
export interface LogEntry {
  id: number;
  level: 'log' | 'error' | 'warn' | 'debug';
  timestamp: Date;
  message: string;
  context?: string;
}

@Injectable()
export class LogsService {
  private logs: LogEntry[] = [];

  findAll(): LogEntry[] {
    return this.logs;
  }

  findOne(id: number): LogEntry | null {
    return this.logs.find((log) => log.id === id) || null;
  }

  create(
    level: LogEntry['level'],
    message: string,
    context?: string,
  ): LogEntry {
    const entry: LogEntry = {
      id: this.logs.length + 1,
      level,
      timestamp: new Date(),
      message,
      context,
    };
    this.logs.push(entry);
    return entry;
  }
}
