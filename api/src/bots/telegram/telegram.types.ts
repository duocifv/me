// telegram.types.ts

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  last_name?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  title?: string;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  first_name?: string;
  last_name?: string;
  username?: string;
  all_members_are_administrators?: boolean;
  accepted_gift_types?: {
    unlimited_gifts: boolean;
    limited_gifts: boolean;
    unique_gifts: boolean;
    premium_subscription: boolean;
  };
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  caption?: string;
}

export interface TelegramResponse {
  ok: boolean;
  result: TelegramMessage;
}
