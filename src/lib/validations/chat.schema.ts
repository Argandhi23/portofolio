import { z } from 'zod';

export const chatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z
    .string()
    .trim()
    .min(1, 'Isi riwayat pesan tidak boleh kosong')
    .max(1200, 'Riwayat pesan terlalu panjang'),
});

export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Pesan tidak boleh kosong')
    .max(600, 'Pesan maksimal 600 karakter'),
  locale: z.enum(['en', 'id']).default('id'),
  history: z.array(chatHistoryItemSchema).max(8).optional().default([]),
});

export type ChatHistoryItem = z.infer<typeof chatHistoryItemSchema>;
export type ChatMessageInput = z.input<typeof chatMessageSchema>;

export interface ChatActionLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ChatReplyPayload {
  reply: string;
  mode: 'ai' | 'smart-local';
  links?: ChatActionLink[];
  suggestedQuestions?: string[];
}
