"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolUsed?: string;
  action?: {
    type: string;
    label: string;
    url: string;
  };
  requiresConfirmation?: boolean;
}

export default function AiAssistantPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your LeadPilot AI Assistant. I operate through controlled server tools to help you inspect leads, check overdue follow-ups, query source performance, and draft grounded WhatsApp messages. How can I help you right now?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      } else {
        window.location.href = "/login";
      }
    }
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    if (!customQuery) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            toolUsed: data.toolUsed,
            action: data.action,
            requiresConfirmation: data.requiresConfirmation,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an issue processing your query with the server tools.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error connecting to assistant service.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Show me my hottest leads.",
    "Which leads haven't been contacted?",
    "Which leads are overdue for follow-up?",
    "How many leads came from WhatsApp this month?",
    "Which properties match Rajesh's requirement?",
    "Draft a follow-up for Kumar.",
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header
          title="AI CRM Assistant"
          subtitle="Grounded natural language operations via controlled server-side tools"
        />

        <main className="flex-1 flex flex-col p-3 sm:p-6 pb-20 md:pb-6 overflow-hidden max-w-4xl w-full mx-auto">
          {/* Quick Prompts Carousel */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Suggested Prompts:
            </p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-3 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 rounded-full text-xs font-medium text-slate-700 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 space-y-2 ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20"
                      : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm"
                  }`}
                >
                  {/* Tool used badge */}
                  {m.toolUsed && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-mono mb-1">
                      <Terminal className="w-3 h-3 text-indigo-600" />
                      <span>{m.toolUsed}</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Requires Confirmation alert */}
                  {m.requiresConfirmation && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Action requires agent review before sending to external customer.</span>
                    </div>
                  )}

                  {/* Action Link button */}
                  {m.action && (
                    <div className="pt-2">
                      <Link
                        href={m.action.url}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-[11px] shadow-sm transition-colors"
                      >
                        <span>{m.action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl rounded-tl-none border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  <span>Executing server tool query...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything (e.g. 'Show me my hottest leads' or 'Draft a follow-up for Kumar')..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

