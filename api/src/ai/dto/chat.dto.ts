export class MessageDto {
  sessionId: string;
  message: string;
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export class ConfirmDto {
  sessionId: string;
}

export class ChatMessageResponse {
  aiReply: string;
  confirmRequired: boolean;
  summaryMessage?: string | null;
}

export class ConfirmResponse {
  success: boolean;
  message: string;
}
