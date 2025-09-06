// src/dto/message.dto.ts
export class MessageDto {
  sessionId!: string;
  message!: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

// src/dto/confirm.dto.ts
export class ConfirmDto {
  sessionId!: string;
  text!: string; // expected format: "XÁC NHẬN <code>" or "YES <code>"
}
