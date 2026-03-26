'use client';

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bot,
  Sparkles,
  Send,
  X,
  Building2,
  ShoppingCart,
  ShieldCheck,
  FileText,
  Languages,
  Lightbulb,
  Briefcase,
} from "lucide-react";

type AgentMode = "buyer" | "factory" | "admin";
type Lang = "ar" | "en";

type AgentContext = {
  mode: AgentMode;
  currentPage: string;
  currentProduct?: string;
  currentFactory?: string;
  currentRFQ?: string;
  language: Lang;
  userProfile?: any;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

type QuickAction = {
  id: string;
  labelAr: string;
  labelEn: string;
  promptAr: string;
  promptEn: string;
};

type Props = {
  language?: Lang;
  currentPage?: string;
  currentProduct?: string;
  currentFactory?: string;
  currentRFQ?: string;
  className?: string;
};

const STORAGE_KEY = "gulfactory_agent_state_v2";

const quickActionsByMode: Record<AgentMode, QuickAction[]> = {
  buyer: [
    {
      id: "supplier-match",
      labelAr: "اقترح موردين",
      labelEn: "Recommend suppliers",
      promptAr: "اقترح أفضل الموردين المناسبين بناءً على السياق الحالي باختصار.",
      promptEn: "Recommend the best matching suppliers based on context briefly.",
    },
    {
      id: "rfq-draft",
      labelAr: "اكتب RFQ",
      labelEn: "Write RFQ draft",
      promptAr: "اكتب طلب عرض سعر RFQ احترافي ومختصر للمنتج الحالي.",
      promptEn: "Write a short, professional RFQ draft for the current product.",
    },
    {
      id: "compare",
      labelAr: "قارن الموردين",
      labelEn: "Compare suppliers",
      promptAr: "قارن الموردين المحتملين باختصار (الثقة، السرعة، MOQ).",
      promptEn: "Briefly compare potential suppliers (trust, speed, MOQ).",
    },
  ],
  factory: [
    {
      id: "improve-description",
      labelAr: "حسّن الوصف",
      labelEn: "Improve description",
      promptAr: "حسّن وصف المنتج الحالي ليكون مقنعاً للمشترين التجاريين (B2B) باختصار.",
      promptEn: "Briefly improve the current product description for B2B buyers.",
    },
    {
      id: "reply-rfq",
      labelAr: "رد على RFQ",
      labelEn: "Draft RFQ reply",
      promptAr: "اكتب رداً احترافياً ومختصراً على RFQ الحالي.",
      promptEn: "Draft a short, professional response to the current RFQ.",
    },
    {
      id: "live-title",
      labelAr: "عنوان للبث",
      labelEn: "Suggest live title",
      promptAr: "اقترح عنواناً جذاباً للبث المباشر الحالي.",
      promptEn: "Suggest a catchy title for the current live session.",
    },
  ],
  admin: [
    {
      id: "market-summary",
      labelAr: "لخص النشاط",
      labelEn: "Summarize activity",
      promptAr: "لخص نشاط المنصة الحالي في نقاط سريعة.",
      promptEn: "Summarize current marketplace activity in quick bullet points.",
    },
    {
      id: "risk-alerts",
      labelAr: "اكتشف المخاطر",
      labelEn: "Find risks",
      promptAr: "حدد المخاطر المحتملة في السياق الحالي باختصار.",
      promptEn: "Briefly identify potential risks in the current context.",
    },
    {
      id: "dashboard-insight",
      labelAr: "حلل الداشبورد",
      labelEn: "Analyze dashboard",
      promptAr: "أعطني أهم 3 استنتاجات من الداشبورد الحالي.",
      promptEn: "Give me the top 3 insights from the current dashboard.",
    },
  ],
};

const t = (lang: Lang, ar: string, en: string) => (lang === "ar" ? ar : en);

function buildSystemPrompt(context: AgentContext) {
  const roleDesc = {
    buyer: "You are an expert B2B procurement assistant helping a buyer find suppliers, compare quotes, and draft RFQs.",
    factory: "You are an expert B2B sales and production assistant helping a factory optimize product listings, respond to RFQs, and manage operations.",
    admin: "You are an expert B2B marketplace administrator assistant helping monitor platform activity, identify risks, and analyze performance metrics."
  }[context.mode];

  const userContext = context.userProfile ? `
User Info:
- Name: ${context.userProfile.displayName || context.userProfile.name}
- Company: ${context.userProfile.companyName || "N/A"}
- Role: ${context.userProfile.role}
` : "";

  return `You are GulfFactory Copilot, an internal smart agent.
Role: ${roleDesc}
Language: ${context.language === 'ar' ? 'Arabic' : 'English'}
${userContext}
Current Context:
- Page: ${context.currentPage}
- Product: ${context.currentProduct || "None"}
- Factory: ${context.currentFactory || "None"}
- RFQ: ${context.currentRFQ || "None"}

Strict Rules:
1. Be extremely concise and direct. No fluff.
2. Focus strictly on B2B commercial value.
3. Always suggest 1 clear next action for the user.
4. Use short bullet points for readability.
5. You MUST respond ONLY in ${context.language === 'ar' ? 'Arabic' : 'English'}.`;
}

async function callGemini(messages: Message[], context: AgentContext): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return context.language === "ar"
      ? "مفتاح Gemini مفقود."
      : "Gemini API key missing.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Compact history: only last 4 messages to save tokens and latency
  const recentMessages = messages.slice(-4);
  const prompt = `Chat:\n${recentMessages
    .map((m) => `${m.role === "user" ? "U" : "A"}: ${m.text}`)
    .join("\n")}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        systemInstruction: buildSystemPrompt(context),
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });
    return response.text || "Error generating response.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Gemini request failed");
  }
}

// --- Memoized Sub-components ---

const AgentHeader = memo(({ language, mode, setMode, setOpen, contextChips }: { 
  language: Lang, 
  mode: AgentMode, 
  setMode: (m: AgentMode) => void, 
  setOpen: (o: boolean) => void,
  contextChips: string[]
}) => (
  <div className="border-b border-slate-200 px-4 py-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-950 p-2 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {t(language, "الوكيل الذكي", "Smart Agent")}
          </h2>
          <p className="text-sm text-slate-500">
            {t(language, "مساعد B2B", "B2B Copilot")}
          </p>
        </div>
      </div>
      <button onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
        <X className="h-5 w-5" />
      </button>
    </div>

    <div className="mt-4 grid grid-cols-3 gap-2">
      {(["buyer", "factory", "admin"] as AgentMode[]).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
            mode === m ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {m === "buyer" && <ShoppingCart className="h-4 w-4" />}
          {m === "factory" && <Building2 className="h-4 w-4" />}
          {m === "admin" && <ShieldCheck className="h-4 w-4" />}
          {t(language, m === "buyer" ? "مشتري" : m === "factory" ? "مصنع" : "إدارة", m.charAt(0).toUpperCase() + m.slice(1))}
        </button>
      ))}
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      {contextChips.map((chip) => (
        <span key={chip} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          {chip}
        </span>
      ))}
    </div>
  </div>
));
AgentHeader.displayName = "AgentHeader";

const QuickActionsList = memo(({ language, actions, onSend }: { language: Lang, actions: QuickAction[], onSend: (text: string) => void }) => (
  <div className="border-b border-slate-200 px-4 py-3 bg-slate-50/50">
    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
      <Lightbulb className="h-4 w-4 text-amber-500" />
      {t(language, "إجراءات سريعة", "Quick actions")}
    </div>
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onSend(language === "ar" ? action.promptAr : action.promptEn)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
        >
          {language === "ar" ? action.labelAr : action.labelEn}
        </button>
      ))}
    </div>
  </div>
));
QuickActionsList.displayName = "QuickActionsList";

const MessageList = memo(({ messages, loading, language, sessionNotes, listRef }: { 
  messages: Message[], 
  loading: boolean, 
  language: Lang, 
  sessionNotes: string[],
  listRef: React.RefObject<HTMLDivElement | null>
}) => (
  <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 px-4 py-4 scroll-smooth">
    {messages.map((message) => (
      <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          message.role === "user" ? "bg-slate-950 text-white" : "bg-white text-slate-800 border border-slate-200"
        }`}>
          {message.text}
        </div>
      </div>
    ))}
    {loading && (
      <div className="flex justify-start">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm animate-pulse">
          {t(language, "جاري التفكير...", "Thinking...")}
        </div>
      </div>
    )}
    {sessionNotes.length > 0 && (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-3 mt-4 opacity-70">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600">
          <Briefcase className="h-4 w-4" />
          {t(language, "ذاكرة الجلسة", "Session memory")}
        </div>
        <div className="space-y-1">
          {sessionNotes.map((note, index) => (
            <div key={`${note}-${index}`} className="text-xs text-slate-500 truncate">
              • {note}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
));
MessageList.displayName = "MessageList";

const Composer = memo(({ language, input, setInput, onSend, loading }: {
  language: Lang,
  input: string,
  setInput: (v: string) => void,
  onSend: (text: string) => void,
  loading: boolean
}) => (
  <div className="border-t border-slate-200 bg-white px-4 py-3">
    <div className="mb-3 flex gap-2 text-xs overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onSend(t(language, "لخص الصفحة الحالية في 3 نقاط.", "Summarize current page in 3 points."))}
        className="flex whitespace-nowrap items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        <FileText className="h-4 w-4" />
        {t(language, "لخص الصفحة", "Summarize")}
      </button>
      <button
        onClick={() => onSend(t(language, "ترجم المحتوى الحالي باختصار.", "Translate current content briefly."))}
        className="flex whitespace-nowrap items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        <Languages className="h-4 w-4" />
        {t(language, "ترجم", "Translate")}
      </button>
    </div>
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend(input)}
        placeholder={t(language, "اكتب رسالتك هنا...", "Type your message here...")}
        className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-slate-50 focus:bg-white"
      />
      <button
        onClick={() => onSend(input)}
        disabled={loading || !input.trim()}
        className="rounded-xl bg-slate-950 px-4 py-2 text-white disabled:opacity-50 hover:bg-slate-800 transition-colors flex items-center justify-center"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  </div>
));
Composer.displayName = "Composer";

// --- Main Component ---

export default function AIAssistant({
  language = "ar",
  currentPage = "/dashboard",
  currentProduct,
  currentFactory,
  currentRFQ,
  className = "",
}: Props) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AgentMode>("buyer");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionNotes, setSessionNotes] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>(messages);

  useEffect(() => {
    if (profile?.role) {
      setMode(profile.role as AgentMode);
    }
  }, [profile]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const context = useMemo<AgentContext>(
    () => ({ mode, language, currentPage, currentProduct, currentFactory, currentRFQ, userProfile: profile }),
    [mode, language, currentPage, currentProduct, currentFactory, currentRFQ, profile]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.mode) setMode(parsed.mode);
      if (Array.isArray(parsed.messages)) setMessages(parsed.messages.slice(-10));
      if (Array.isArray(parsed.sessionNotes)) setSessionNotes(parsed.sessionNotes.slice(-4));
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, messages: messages.slice(-10), sessionNotes: sessionNotes.slice(-4) })
      );
    }
  }, [mode, messages, sessionNotes]);

  useEffect(() => {
    if (listRef.current && open) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: crypto.randomUUID(),
        role: "assistant",
        text: language === "ar"
            ? "أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟"
            : "I'm your smart assistant. How can I help you today?",
        createdAt: Date.now(),
      }]);
    }
  }, [language, messages.length]);

  const contextChips = useMemo(() => [
    `${t(language, "الصفحة", "Page")}: ${currentPage?.split('/')?.pop() || 'home'}`,
    currentProduct ? `${t(language, "المنتج", "Prod")}: ${currentProduct}` : null,
    currentFactory ? `${t(language, "المصنع", "Fact")}: ${currentFactory}` : null,
  ].filter(Boolean) as string[], [language, currentPage, currentProduct, currentFactory]);

  const handleSend = useCallback(async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || loading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text: trimmedText, createdAt: Date.now() };
    const nextMessages = [...messagesRef.current, userMessage];
    
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await callGemini(nextMessages, context);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: reply, createdAt: Date.now() }]);
      setSessionNotes((prev) => [`${trimmedText.slice(0, 40)}...`, ...prev].slice(0, 4));
    } catch (error) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: "Error connecting to agent.", createdAt: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }, [loading, context]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl transition hover:scale-105 active:scale-95 ${className}`}
        aria-label="AI Assistant"
      >
        <Bot className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl sm:max-w-lg flex flex-col animate-in slide-in-from-right duration-300">
            <AgentHeader language={language} mode={mode} setMode={setMode} setOpen={setOpen} contextChips={contextChips} />
            <QuickActionsList language={language} actions={quickActionsByMode[mode]} onSend={handleSend} />
            <MessageList messages={messages} loading={loading} language={language} sessionNotes={sessionNotes} listRef={listRef} />
            <Composer language={language} input={input} setInput={setInput} onSend={handleSend} loading={loading} />
          </div>
        </div>
      )}
    </>
  );
}