'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { sendChatMessage } from '@/actions/chat.actions';
import { useLanguage } from '@/components/public/LanguageProvider';
import { getDefaultSuggestions } from '@/lib/chatbot-engine';
import { cn } from '@/lib/utils';
import type {
  ChatActionLink,
  ChatHistoryItem,
} from '@/lib/validations/chat.schema';

interface ChatBubbleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  links?: ChatActionLink[];
}

/**
 * Safely renders **bold** segments without dangerouslySetInnerHTML.
 */
function renderInlineBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

/**
 * Renders assistant message paragraphs and bullet lists cleanly.
 */
function FormattedChatMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: Array<
    | { type: 'p'; text: string }
    | { type: 'ul'; items: string[] }
  > = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('- ') || line.startsWith('• ')) {
      const itemText = line.slice(2).trim();
      const prev = blocks[blocks.length - 1];
      if (prev && prev.type === 'ul') {
        prev.items.push(itemText);
      } else {
        blocks.push({ type: 'ul', items: [itemText] });
      }
    } else {
      blocks.push({ type: 'p', text: line });
    }
  }

  return (
    <div className="space-y-2 text-[13px] leading-[1.6]">
      {blocks.map((block, i) => {
        if (block.type === 'ul') {
          return (
            <ul key={i} className="space-y-1.5 pl-0.5">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-white/85">
                  <span className="mt-2 h-1 w-1 rounded-full bg-[#9E1B32] shrink-0" />
                  <span>{renderInlineBold(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="text-white/85">
            {renderInlineBold(block.text)}
          </p>
        );
      })}
    </div>
  );
}

export function ChatWidget() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [customSuggestions, setCustomSuggestions] = useState<string[] | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgCounterRef = useRef(0);

  const suggestions = useMemo(
    () => customSuggestions ?? getDefaultSuggestions(lang),
    [customSuggestions, lang]
  );

  const welcomeMessage = useMemo<ChatBubbleMessage>(
    () => ({
      id: 'welcome',
      role: 'assistant',
      content:
        lang === 'id'
          ? 'Halo! Lagi mampir lihat portofolio Faqih ya? Kalau mau tanya soal project, layanan web/aplikasi, atau sekadar ngobrol, tulis aja santai di sini.'
          : "Hey there! Exploring Faqih's portfolio? Feel free to ask anything about his projects, web/mobile development, or just say hi.",
    }),
    [lang]
  );

  // Auto-scroll to newest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isPending, isOpen]);

  // Focus input when opened & support Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleResetChat = () => {
    setMessages([]);
    setInput('');
    setCustomSuggestions(null);
  };

  const submitQuestion = (rawQuestion: string) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed || isPending) return;

    msgCounterRef.current += 1;
    const seq = msgCounterRef.current;

    const userMsg: ChatBubbleMessage = {
      id: `user-${seq}`,
      role: 'user',
      content: trimmed,
    };

    const historyForServer: ChatHistoryItem[] = messages
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    startTransition(async () => {
      const res = await sendChatMessage({
        message: trimmed,
        locale: lang,
        history: historyForServer,
      });

      if (res.success && res.data) {
        const botMsg: ChatBubbleMessage = {
          id: `bot-${seq}`,
          role: 'assistant',
          content: res.data.reply,
          links: res.data.links,
        };
        setMessages((prev) => [...prev, botMsg]);
        if (
          res.data.suggestedQuestions &&
          res.data.suggestedQuestions.length > 0
        ) {
          setCustomSuggestions(res.data.suggestedQuestions);
        }
      } else {
        const errorMsg: ChatBubbleMessage = {
          id: `err-${seq}`,
          role: 'assistant',
          content:
            res.message ||
            (lang === 'id'
              ? 'Maaf, pesan belum dapat diproses saat ini. Silakan coba lagi.'
              : 'Sorry, your message could not be processed right now. Please try again.'),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitQuestion(input);
  };

  const allDisplayedMessages = [welcomeMessage, ...messages];

  return (
    <div
      data-lenis-prevent
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex flex-col items-end"
    >
      {/* CHAT WINDOW PANEL */}
      {isOpen && (
        <section
          role="dialog"
          aria-label={
            lang === 'id'
              ? 'Asisten Chat Portofolio Argandhi'
              : 'Argandhi Portfolio Chat Assistant'
          }
          className="mb-3 w-[calc(100vw-2.5rem)] max-w-[360px] h-[470px] max-h-[calc(100vh-7.5rem)] rounded-[20px] bg-[#0B0B0B]/95 backdrop-blur-xl border border-white/[0.09] shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* 1. MINIMALIST HEADER */}
          <header className="px-4 py-3 bg-[#111111] border-b border-white/[0.07] flex items-center justify-between gap-3 shrink-0">
            <h2 className="text-[13.5px] font-semibold text-white tracking-[-0.01em] truncate">
              Argandhi Assistant
            </h2>

            <div className="flex items-center gap-0.5 shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  title={lang === 'id' ? 'Mulai ulang chat' : 'Reset chat'}
                  aria-label={lang === 'id' ? 'Mulai ulang chat' : 'Reset chat'}
                  className="p-1.5 rounded-full text-white/45 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={lang === 'id' ? 'Tutup chat' : 'Close chat'}
                className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* 2. MESSAGE STREAM */}
          <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 scrollbar-thin">
            {allDisplayedMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col gap-1.5',
                    isUser ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[86%] rounded-2xl px-3.5 py-2.5',
                      isUser
                        ? 'bg-[#9E1B32] text-white rounded-br-sm text-[13px] leading-[1.55]'
                        : 'bg-[#151515] border border-white/[0.06] text-white/85 rounded-bl-sm'
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    ) : (
                      <FormattedChatMessage content={msg.content} />
                    )}
                  </div>

                  {/* Contextual Action Links */}
                  {!isUser && msg.links && msg.links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-w-[90%]">
                      {msg.links.map((link) =>
                        link.external ? (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-[#161616] hover:bg-white/[0.08] border border-white/[0.1] px-2.5 py-1 text-[11px] font-medium text-white/80 hover:text-white transition"
                          >
                            <span>{link.label}</span>
                            <ArrowUpRight className="h-3 w-3 text-[#9E1B32]" />
                          </a>
                        ) : (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 rounded-full bg-[#161616] hover:bg-white/[0.08] border border-white/[0.1] px-2.5 py-1 text-[11px] font-medium text-white/80 hover:text-white transition"
                          >
                            <span>{link.label}</span>
                            <ArrowUpRight className="h-3 w-3 text-[#9E1B32]" />
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isPending && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-bl-sm bg-[#151515] border border-white/[0.06] px-3.5 py-2.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:-0.25s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:-0.12s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. STARTER CHIPS (Only shown before the user starts chatting) */}
          {!isPending && messages.length === 0 && suggestions.length > 0 && (
            <div className="px-3.5 py-2 bg-[#0E0E0E] border-t border-white/[0.05] shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => submitQuestion(q)}
                    className="shrink-0 rounded-full bg-[#161616] hover:bg-[#1E1E1E] border border-white/[0.08] px-2.5 py-1 text-[11px] text-white/75 hover:text-white transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. INPUT FORM */}
          <form
            onSubmit={handleFormSubmit}
            className="p-2.5 bg-[#0E0E0E] border-t border-white/[0.07] shrink-0"
          >
            <div className="relative flex items-center bg-[#151515] border border-white/[0.09] focus-within:border-white/25 rounded-full pl-3.5 pr-1.5 py-1 transition">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={600}
                disabled={isPending}
                placeholder={
                  lang === 'id' ? 'Ketik pesan...' : 'Type a message...'
                }
                aria-label={
                  lang === 'id' ? 'Ketik pesan chat' : 'Type a chat message'
                }
                className="flex-1 bg-transparent text-[12.5px] text-white placeholder:text-white/35 focus:outline-none disabled:opacity-50 py-1"
              />
              <button
                type="submit"
                disabled={isPending || input.trim().length === 0}
                aria-label={lang === 'id' ? 'Kirim pesan' : 'Send message'}
                className="h-7 w-7 rounded-full bg-[#9E1B32] hover:bg-[#B8233E] disabled:bg-white/[0.06] disabled:text-white/25 text-white flex items-center justify-center transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </section>
      )}

      {/* FLOATING LAUNCHER BUTTON (Editorial Pill Style) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={
          isOpen
            ? lang === 'id'
              ? 'Tutup asisten chat'
              : 'Close chat assistant'
            : lang === 'id'
              ? 'Buka asisten chat'
              : 'Open chat assistant'
        }
        className={cn(
          'group inline-flex items-center gap-3 rounded-full pl-4 pr-1.5 py-1.5 text-[12.5px] font-semibold tracking-[-0.01em] select-none transition-all duration-200 cursor-pointer',
          'bg-[#111111]/95 hover:bg-[#171717] backdrop-blur-md text-white border border-white/[0.12] hover:border-white/[0.22] shadow-[0_14px_34px_rgba(0,0,0,0.75)]'
        )}
      >
        <span>
          {isOpen
            ? lang === 'id'
              ? 'Tutup Chat'
              : 'Close Chat'
            : lang === 'id'
              ? 'Tanya Asisten'
              : 'Ask Assistant'}
        </span>
        <span
          className={cn(
            'h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200',
            isOpen
              ? 'bg-white/[0.1] text-white group-hover:bg-white/[0.16]'
              : 'bg-[#9E1B32] text-white group-hover:bg-[#B8233E] group-hover:scale-105'
          )}
        >
          {isOpen ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
    </div>
  );
}
