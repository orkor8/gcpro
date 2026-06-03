"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS_GCP = [
  "מה ההבדל בין ICH E6 R1 ל-R2?",
  "אילו אחריות יש לחוקר הראשי (PI)?",
  "מה זה TMF ואיזה מסמכים הוא כולל?",
  "איך מגישים AE לוועדת הלסינקי?",
];

const SUGGESTED_QUESTIONS_CRA = [
  "מה כוללת ביקורת אתר (Site Visit) של CRA?",
  "מה זה SDV ואיך עושים אותו נכון?",
  "מה ההבדל בין ביקור פתיחה לביקור ניטור?",
  "איך CRA מנהל deviation שחלה באתר?",
];

export function BotChat({ userName, role }: { userName: string; role: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const suggestions = role === "student_cra" ? SUGGESTED_QUESTIONS_CRA : SUGGESTED_QUESTIONS_GCP;
  const botName = role === "student_cra" ? "CRA Bot" : "GCP Bot";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setLoadingSeconds(0);
    loadingTimerRef.current = setInterval(() => {
      setLoadingSeconds(s => s + 1);
    }, 1000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("שגיאה בשרת");
      if (!res.body) throw new Error("אין תגובה");

      // Start streaming
      const assistantMsg: Message = { role: "assistant", content: "" };
      setMessages(m => [...m, assistantMsg]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(m => {
          const updated = [...m];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "מצטער, אירעה שגיאה. נסה שוב." }]);
    } finally {
      setIsLoading(false);
      setLoadingSeconds(0);
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 180px)", minHeight: 500 }}>
      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl mb-4 p-4 space-y-4"
        style={{ background: "white", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 12px rgba(15,38,69,0.06)" }}
      >
        {/* Welcome */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284c7)", boxShadow: "0 8px 24px rgba(14,165,233,0.3)" }}
            >
              <svg width="28" height="28" fill="white" viewBox="0 0 20 20">
                <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192Z" />
                <path d="M6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684Z" />
              </svg>
            </div>
            <h2 className="font-black text-xl mb-2" style={{ color: "#0F2645" }}>
              שלום {userName.split(" ")[0]}! 👋
            </h2>
            <p className="text-slate-500 text-sm mb-6" style={{ maxWidth: 380 }}>
              אני {botName} — הבוט החכם של GCPRO. שאל אותי כל שאלה על {role === "student_cra" ? "עבודת CRA, ניטור ניסויים ורגולציה קלינית" : "GCP, רגולציה קלינית ומחקר קליני"}.
            </p>

            <div className="w-full" style={{ maxWidth: 480 }}>
              <p className="text-xs font-semibold text-slate-400 mb-3">שאלות מומלצות:</p>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-right px-4 py-3 rounded-xl text-sm transition-all hover:shadow-sm"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#0F2645" }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
            {msg.role === "user" ? (
              <div
                className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%] text-right"
                style={{ background: "rgba(14,165,233,0.1)", color: "#0F2645", border: "1px solid rgba(14,165,233,0.2)" }}
              >
                {msg.content}
              </div>
            ) : (
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] text-right leading-relaxed"
                style={{ background: "#f8fafc", color: "#1e293b", border: "1.5px solid #e2e8f0" }}
              >
                {msg.content ? (
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="font-black text-base mb-2 mt-1" style={{ color: "#0F2645" }}>{children}</h1>,
                      h2: ({ children }) => <h2 className="font-bold text-sm mb-2 mt-3" style={{ color: "#0F2645" }}>{children}</h2>,
                      h3: ({ children }) => <h3 className="font-semibold text-sm mb-1 mt-2" style={{ color: "#0F2645" }}>{children}</h3>,
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-bold" style={{ color: "#0F2645" }}>{children}</strong>,
                      ul: ({ children }) => <ul className="mb-2 space-y-1 pr-4 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 space-y-1 pr-4 list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      table: ({ children }) => <div className="overflow-x-auto mb-2"><table className="text-xs w-full border-collapse">{children}</table></div>,
                      th: ({ children }) => <th className="px-2 py-1 text-right font-bold border" style={{ background: "rgba(14,165,233,0.1)", borderColor: "#e2e8f0", color: "#0F2645" }}>{children}</th>,
                      td: ({ children }) => <td className="px-2 py-1 text-right border" style={{ borderColor: "#e2e8f0" }}>{children}</td>,
                      code: ({ children }) => <code className="px-1 py-0.5 rounded text-xs" style={{ background: "rgba(14,165,233,0.1)", color: "#0284c7" }}>{children}</code>,
                      hr: () => <hr className="my-2" style={{ borderColor: "#e2e8f0" }} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex flex-col items-end gap-2">
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm"
              style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
            >
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
            {loadingSeconds >= 5 && (
              <p className="text-xs text-slate-400 ml-1">
                {loadingSeconds < 10
                  ? "מחפש בחומר הקורס..."
                  : loadingSeconds < 20
                  ? "השאלה מורכבת, עוד רגע..."
                  : "כמעט סיים..."}
              </p>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="rounded-2xl p-3 flex items-end gap-3"
        style={{ background: "white", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 12px rgba(15,38,69,0.06)" }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="שאל שאלה על GCP, CRA, רגולציה קלינית..."
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none text-sm outline-none leading-relaxed bg-transparent"
          style={{ color: "#0F2645", maxHeight: 120, minHeight: 40, paddingTop: 10, paddingBottom: 10 }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: input.trim() && !isLoading ? "linear-gradient(135deg, #0EA5E9, #0284c7)" : "#f1f5f9",
            color: input.trim() && !isLoading ? "white" : "#94a3b8",
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </div>

      <div className="mt-3 px-4 py-3 rounded-xl text-xs text-center leading-relaxed" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#92400e" }}>
        ⚠️ הבוט מבוסס אך ורק על חומר הקורס ועלול לטעות. השתמש בו לחזרה והכנה — לא כתחליף לחומר המקורי, להנחיות המרצה, או לתקנות הרשמיות במהלך ביצוע מחקר קליני.
      </div>
    </div>
  );
}
