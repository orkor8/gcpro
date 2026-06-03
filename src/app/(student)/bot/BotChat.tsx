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
  const accentColor = role === "student_cra" ? "#a78bfa" : "#38bdf8";
  const accentGlow = role === "student_cra" ? "rgba(167,139,250,0.3)" : "rgba(56,189,248,0.3)";

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
    <>
      <style>{`
        .bot-root {
          min-height: 100vh;
          background: #07101f;
          font-family: var(--font-rubik, 'Rubik', sans-serif);
        }

        /* HERO */
        .bot-hero {
          position: relative; overflow: hidden;
          padding: 44px 40px 36px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .bot-hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 50% 80% at 85% 50%, rgba(14,165,233,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 30% 50% at 15% 80%, rgba(139,92,246,0.07) 0%, transparent 60%);
        }
        .bot-hero-grid {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .bot-hero-content { position: relative; }
        .bot-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.12em;
          color: #38bdf8; text-transform: uppercase; margin-bottom: 14px;
        }
        .bot-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #38bdf8; box-shadow: 0 0 10px #38bdf8;
          animation: bot-pulse 2s ease-in-out infinite;
        }
        @keyframes bot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .bot-hero-title {
          font-size: clamp(24px, 3.5vw, 38px); font-weight: 900;
          color: #fff; line-height: 1.15; letter-spacing: -0.02em;
          margin: 0 0 10px;
        }
        .bot-hero-title span {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .bot-hero-sub { font-size: 14px; color: rgba(255,255,255,0.4); margin: 0; line-height: 1.6; }

        /* CHAT CONTAINER */
        .bot-chat-wrap {
          max-width: 860px; margin: 0 auto;
          padding: 32px 40px 24px;
          display: flex; flex-direction: column;
          height: calc(100vh - 220px);
          min-height: 500px;
        }
        @media (max-width: 640px) {
          .bot-hero { padding: 32px 20px 28px; }
          .bot-chat-wrap { padding: 20px 16px 16px; height: calc(100vh - 200px); }
        }

        /* MESSAGES */
        .bot-messages {
          flex: 1; overflow-y: auto; padding-right: 4px;
          display: flex; flex-direction: column; gap: 16px;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .bot-messages::-webkit-scrollbar { width: 4px; }
        .bot-messages::-webkit-scrollbar-track { background: transparent; }
        .bot-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        /* WELCOME */
        .bot-welcome {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; flex: 1; text-align: center; padding: 24px 16px;
          gap: 0;
        }
        .bot-avatar {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #0EA5E9, #0284c7);
          box-shadow: 0 0 40px rgba(14,165,233,0.35), 0 8px 32px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          position: relative;
        }
        .bot-avatar::after {
          content: ''; position: absolute; inset: -1px; border-radius: 21px;
          background: linear-gradient(135deg, rgba(56,189,248,0.5), rgba(129,140,248,0.3));
          z-index: -1; filter: blur(8px);
        }
        .bot-welcome-name {
          font-size: 22px; font-weight: 900; color: #fff;
          margin-bottom: 8px; letter-spacing: -0.01em;
        }
        .bot-welcome-sub {
          font-size: 14px; color: rgba(255,255,255,0.4);
          line-height: 1.6; margin-bottom: 28px; max-width: 380px;
        }
        .bot-suggestions-label {
          font-size: 11px; font-weight: 800; letter-spacing: 0.08em;
          color: rgba(255,255,255,0.25); text-transform: uppercase;
          margin-bottom: 12px; width: 100%; text-align: right; max-width: 480px;
        }
        .bot-suggestions {
          display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 480px;
        }
        .bot-suggestion-btn {
          text-align: right; padding: 12px 16px; border-radius: 12px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.65);
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .bot-suggestion-btn:hover {
          background: rgba(14,165,233,0.08);
          border-color: rgba(14,165,233,0.25);
          color: rgba(255,255,255,0.9);
          transform: translateX(-2px);
        }
        .bot-suggestion-arrow { opacity: 0; transition: opacity 0.2s; flex-shrink: 0; }
        .bot-suggestion-btn:hover .bot-suggestion-arrow { opacity: 1; }

        /* BUBBLE */
        .bot-bubble-user {
          align-self: flex-start;
          max-width: 80%;
          background: rgba(14,165,233,0.12);
          border: 1px solid rgba(14,165,233,0.2);
          border-radius: 18px 18px 4px 18px;
          padding: 12px 16px;
          font-size: 14px; color: #e2e8f0; line-height: 1.6; text-align: right;
        }
        .bot-bubble-ai {
          align-self: flex-end;
          max-width: 85%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px 18px 18px 4px;
          padding: 14px 18px;
          font-size: 14px; color: #cbd5e1; line-height: 1.7; text-align: right;
        }
        .bot-bubble-ai h1 { font-size: 15px; font-weight: 900; color: #f1f5f9; margin: 0 0 8px; }
        .bot-bubble-ai h2 { font-size: 14px; font-weight: 800; color: #f1f5f9; margin: 12px 0 6px; }
        .bot-bubble-ai h3 { font-size: 13px; font-weight: 700; color: #e2e8f0; margin: 10px 0 4px; }
        .bot-bubble-ai p { margin: 0 0 8px; }
        .bot-bubble-ai p:last-child { margin-bottom: 0; }
        .bot-bubble-ai strong { font-weight: 700; color: #38bdf8; }
        .bot-bubble-ai ul { margin: 6px 0; padding-right: 18px; list-style: disc; }
        .bot-bubble-ai ol { margin: 6px 0; padding-right: 18px; list-style: decimal; }
        .bot-bubble-ai li { margin-bottom: 4px; }
        .bot-bubble-ai code { padding: 2px 6px; border-radius: 4px; font-size: 12px; background: rgba(56,189,248,0.1); color: #38bdf8; }
        .bot-bubble-ai hr { margin: 10px 0; border-color: rgba(255,255,255,0.08); }
        .bot-bubble-ai table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0; }
        .bot-bubble-ai th { padding: 6px 10px; font-weight: 800; background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(255,255,255,0.08); text-align: right; }
        .bot-bubble-ai td { padding: 5px 10px; border: 1px solid rgba(255,255,255,0.06); color: #94a3b8; }

        /* TYPING */
        .bot-typing {
          display: flex; gap: 5px; align-items: center; padding: 8px 4px;
        }
        .bot-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #38bdf8;
          animation: bot-bounce 1.2s ease-in-out infinite;
        }
        .bot-dot:nth-child(2) { animation-delay: 0.15s; background: #818cf8; }
        .bot-dot:nth-child(3) { animation-delay: 0.3s; background: #a78bfa; }
        @keyframes bot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        .bot-loading-hint {
          font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 4px; text-align: left;
        }

        /* INPUT */
        .bot-input-wrap {
          margin-top: 16px;
          border-radius: 16px; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: flex-end; gap: 10px;
          transition: border-color 0.2s;
        }
        .bot-input-wrap:focus-within {
          border-color: rgba(56,189,248,0.4);
          background: rgba(255,255,255,0.05);
        }
        .bot-textarea {
          flex: 1; resize: none; background: transparent; border: none; outline: none;
          font-size: 14px; color: #e2e8f0; line-height: 1.6;
          font-family: var(--font-rubik, 'Rubik', sans-serif);
          min-height: 40px; max-height: 120px;
          padding: 8px 0; direction: rtl;
        }
        .bot-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .bot-send-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #0EA5E9, #0284c7);
          border: none; cursor: pointer;
          box-shadow: 0 0 20px rgba(14,165,233,0.3);
          transition: all 0.2s;
        }
        .bot-send-btn:hover { transform: scale(1.08); box-shadow: 0 0 28px rgba(14,165,233,0.45); }
        .bot-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .bot-hint {
          font-size: 11px; color: rgba(255,255,255,0.18); text-align: center;
          margin-top: 10px; letter-spacing: 0.01em;
        }
      `}</style>

      <div className="bot-root" dir="rtl">

        {/* ── HERO ── */}
        <div className="bot-hero">
          <div className="bot-hero-bg" />
          <div className="bot-hero-grid" />
          <div className="bot-hero-content">
            <div className="bot-eyebrow">
              <span className="bot-eyebrow-dot" />
              מופעל על ידי בינה מלאכותית
            </div>
            <h1 className="bot-hero-title">
              הבוט החכם שלך,<br /><span>{botName}</span>
            </h1>
            <p className="bot-hero-sub">
              שאל כל שאלה על {role === "student_cra" ? "עבודת CRA, ניטור ניסויים, SDV ורגולציה קלינית" : "GCP, ICH E6, רגולציה קלינית ומחקר קליני"} — תקבל תשובה מיידית
            </p>
          </div>
        </div>

        {/* ── CHAT ── */}
        <div className="bot-chat-wrap">
          <div className="bot-messages">

            {/* WELCOME STATE */}
            {messages.length === 0 && (
              <div className="bot-welcome">
                <div className="bot-avatar">
                  <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                    <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192Z" />
                    <path d="M6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684Z" />
                  </svg>
                </div>
                <p className="bot-welcome-name">שלום {userName.split(" ")[0]}! 👋</p>
                <p className="bot-welcome-sub">
                  אני {botName} — שאל אותי כל שאלה על {role === "student_cra" ? "עבודת CRA, ניטור ניסויים ורגולציה קלינית" : "GCP, רגולציה קלינית ומחקר קליני"}. אני כאן לעזור.
                </p>
                <p className="bot-suggestions-label">שאלות מומלצות</p>
                <div className="bot-suggestions">
                  {suggestions.map((q) => (
                    <button key={q} className="bot-suggestion-btn" onClick={() => sendMessage(q)}>
                      <span>{q}</span>
                      <span className="bot-suggestion-arrow">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#38bdf8" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "bot-bubble-user" : "bot-bubble-ai"}>
                {msg.content ? (
                  msg.role === "user" ? msg.content : (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1>{children}</h1>,
                        h2: ({ children }) => <h2>{children}</h2>,
                        h3: ({ children }) => <h3>{children}</h3>,
                        p: ({ children }) => <p>{children}</p>,
                        strong: ({ children }) => <strong>{children}</strong>,
                        ul: ({ children }) => <ul>{children}</ul>,
                        ol: ({ children }) => <ol>{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        table: ({ children }) => <div style={{ overflowX: "auto" }}><table>{children}</table></div>,
                        th: ({ children }) => <th>{children}</th>,
                        td: ({ children }) => <td>{children}</td>,
                        code: ({ children }) => <code>{children}</code>,
                        hr: () => <hr />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )
                ) : (
                  <div className="bot-typing">
                    <span className="bot-dot" />
                    <span className="bot-dot" />
                    <span className="bot-dot" />
                  </div>
                )}
              </div>
            ))}

            {/* LOADING */}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="bot-bubble-ai" style={{ alignSelf: "flex-end" }}>
                <div className="bot-typing">
                  <span className="bot-dot" />
                  <span className="bot-dot" />
                  <span className="bot-dot" />
                </div>
                {loadingSeconds >= 5 && (
                  <p className="bot-loading-hint">
                    {loadingSeconds < 10 ? "מחפש בחומר הקורס..." : loadingSeconds < 20 ? "השאלה מורכבת, עוד רגע..." : "כמעט סיים..."}
                  </p>
                )}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="bot-input-wrap">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`שאל שאלה על ${role === "student_cra" ? "CRA, SDV, ניטור..." : "GCP, ICH E6, רגולציה..."}`}
              rows={1}
              disabled={isLoading}
              className="bot-textarea"
            />
            <button
              className="bot-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="bot-hint">Enter לשליחה · Shift+Enter לשורה חדשה</p>
        </div>

      </div>
    </>
  );
}
