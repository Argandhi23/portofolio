'use server';

import { headers } from 'next/headers';
import {
  buildPortfolioSystemPrompt,
  buildUnlistedInfoRedirectReply,
  checkOutOfScopeGuardrail,
  containsDisallowedCodeOutput,
  containsHallucinatedPortfolioClaims,
  extractRelevantLinks,
  generateSmartLocalReply,
  getDefaultSuggestions,
  type PortfolioChatContext,
} from '@/lib/chatbot-engine';
import { getGeminiApiKey, getGroqApiKey } from '@/lib/env';
import type { Locale } from '@/lib/i18n/localized';
import {
  getBrands,
  getPublishedProjects,
  getServices,
  getSiteSettings,
} from '@/lib/queries/portfolio.queries';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  chatMessageSchema,
  type ChatHistoryItem,
  type ChatMessageInput,
  type ChatReplyPayload,
} from '@/lib/validations/chat.schema';
import type { ActionResult } from '@/types/action.types';

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[];
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

async function getChatRateKey(): Promise<string> {
  try {
    const hdrs = await headers();
    const forwarded = hdrs.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : hdrs.get('x-real-ip') || 'local';
    return `public-chat:${ip}`;
  } catch {
    return 'public-chat:local';
  }
}

async function requestGeminiReply(
  apiKey: string,
  message: string,
  history: ChatHistoryItem[],
  ctx: PortfolioChatContext,
  locale: Locale
): Promise<string | null> {
  const systemPrompt = buildPortfolioSystemPrompt(ctx, locale);

  const contents = [
    ...history.map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }],
    })),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];

  // Use current active Gemini models (gemini-3.8-flash with fallback to gemini-3.5-flash)
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash'];

  for (const modelName of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: 500,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        continue;
      }

      const json = (await response.json()) as GeminiGenerateContentResponse;
      const text = json.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? '')
        .join('')
        .trim();

      if (text && text.length > 0) {
        return text;
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function requestGroqReply(
  apiKey: string,
  message: string,
  history: ChatHistoryItem[],
  ctx: PortfolioChatContext,
  locale: Locale
): Promise<string | null> {
  const systemPrompt = buildPortfolioSystemPrompt(ctx, locale);
  const modelsToTry = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
  ];

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            temperature: 0.2,
            max_tokens: 1024,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history.map((item) => ({
                role: item.role,
                content: item.content,
              })),
              { role: 'user', content: message },
            ],
          }),
          signal: AbortSignal.timeout(9000),
        }
      );

      if (!response.ok) {
        continue;
      }

      const json = (await response.json()) as GroqChatCompletionResponse;
      const rawText = json.choices?.[0]?.message?.content?.trim();
      if (rawText && rawText.length > 0) {
        // Strip <think>...</think> tags if returned by reasoning models
        const cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        if (cleaned.length > 0) {
          return cleaned;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Public Server Action for the Hybrid Portfolio Assistant.
 * Uses Google Gemini AI or Groq Llama 3.3 70B when configured, and automatically
 * falls back to the NLP-scored Portfolio Knowledge Engine backed by cached Supabase data.
 */
export async function sendChatMessage(
  input: ChatMessageInput
): Promise<ActionResult<ChatReplyPayload>> {
  try {
    // 1. Sliding-window rate limit (Max 20 messages per minute per IP)
    const rateKey = await getChatRateKey();
    const rate = checkRateLimit(rateKey, 20, 60_000);
    if (!rate.allowed) {
      const isId = input.locale !== 'en';
      return {
        success: false,
        message: isId
          ? `Terlalu banyak pesan dalam waktu singkat. Silakan tunggu ${rate.retryAfterSeconds} detik.`
          : `Too many messages sent quickly. Please wait ${rate.retryAfterSeconds} seconds.`,
      };
    }

    // 2. Strict Zod Validation
    const parsed = chatMessageSchema.safeParse(input);
    if (!parsed.success) {
      const isId = input.locale !== 'en';
      return {
        success: false,
        message: isId
          ? 'Pesan tidak valid atau terlalu panjang (maksimal 600 karakter).'
          : 'Invalid or overly long message (maximum 600 characters).',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    const { message, locale, history } = parsed.data;

    // 3. Topic Guardrail (Domain Restriction): Immediately refuse out-of-scope requests
    // such as writing HTML/code, solving homework, or general trivia outside the portfolio.
    const guardrailRefusal = checkOutOfScopeGuardrail(message, locale);
    if (guardrailRefusal) {
      return {
        success: true,
        message: 'OK',
        data: guardrailRefusal,
      };
    }

    // 4. Read cached portfolio data (Zero extra database hit thanks to unstable_cache)
    const [settings, services, brands, projects] = await Promise.all([
      getSiteSettings(),
      getServices(),
      getBrands(),
      getPublishedProjects(),
    ]);

    const ctx: PortfolioChatContext = {
      settings,
      services,
      brands,
      projects,
    };

    // 5. Try Pre-trained LLM (Groq first for instant response, then Google Gemini)
    const groqKey = getGroqApiKey();
    const geminiKey = getGeminiApiKey();

    let aiReply: string | null = null;
    if (groqKey) {
      aiReply = await requestGroqReply(groqKey, message, history, ctx, locale);
    }
    if (!aiReply && geminiKey) {
      aiReply = await requestGeminiReply(
        geminiKey,
        message,
        history,
        ctx,
        locale
      );
    }

    // 6. Output Guardrail: ensure AI never leaks code blocks or raw HTML even if tricked
    if (aiReply && containsDisallowedCodeOutput(aiReply)) {
      const fallbackRefusal =
        checkOutOfScopeGuardrail('buatkan code html', locale) ??
        generateSmartLocalReply(message, ctx, locale);
      return {
        success: true,
        message: 'OK',
        data: fallbackRefusal,
      };
    }

    // 7. Anti-Hallucination Guardrail: if AI invents unstated prices, timelines, or packages,
    // replace with an honest redirect to Faqih's WhatsApp / contact form.
    if (aiReply && containsHallucinatedPortfolioClaims(aiReply)) {
      return {
        success: true,
        message: 'OK',
        data: buildUnlistedInfoRedirectReply(message, ctx, locale),
      };
    }

    if (aiReply) {
      const links = extractRelevantLinks(message, aiReply, ctx, locale);
      return {
        success: true,
        message: 'OK',
        data: {
          reply: aiReply,
          mode: 'ai',
          links,
          suggestedQuestions: getDefaultSuggestions(locale),
        },
      };
    }

    // 5. Seamless NLP Knowledge Base Engine using live Supabase portfolio context
    const smartReply = generateSmartLocalReply(message, ctx, locale);

    return {
      success: true,
      message: 'OK',
      data: smartReply,
    };
  } catch {
    const isId = input.locale !== 'en';
    return {
      success: false,
      message: isId
        ? 'Maaf, terjadi kendala koneksi. Silakan coba lagi.'
        : 'Sorry, a connection error occurred. Please try again.',
    };
  }
}
