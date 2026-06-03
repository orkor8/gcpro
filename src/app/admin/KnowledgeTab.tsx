"use client";

import { useState } from "react";
import { addKnowledgeItem, deleteKnowledgeItem } from "./actions";

type ContentType = "video" | "document" | "live" | "article";

interface KnowledgeItem {
  id: string;
  title: string;
  description: string | null;
  content_url: string | null;
  content_type: ContentType;
  cra_only: boolean;
  published_at: string;
}

const typeLabels: Record<ContentType, string> = {
  video: "סרטון",
  document: "מסמך",
  live: "שיעור חי",
  article: "מאמר",
};

const typeColors: Record<ContentType, { color: string; bg: string }> = {
  video: { color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  document: { color: "#0284c7", bg: "rgba(2,132,199,0.08)" },
  live: { color: "#059669", bg: "rgba(5,150,105,0.08)" },
  article: { color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
};

export function KnowledgeTab({ items }: { items: KnowledgeItem[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-sm">{items.length} פריטי תוכן</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: showForm ? "#64748b" : "linear-gradient(135deg, #0EA5E9, #0284c7)" }}
        >
          {showForm ? "ביטול" : "+ הוסף תוכן"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          action={async (fd) => { await addKnowledgeItem(fd); setShowForm(false); }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm space-y-4"
          style={{ border: "1.5px solid #e0f2fe" }}
        >
          <h3 className="font-bold text-base" style={{ color: "#0F2645" }}>הוספת תוכן חדש</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">כותרת *</label>
              <input
                name="title"
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
                placeholder="שם התוכן"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">תיאור קצר</label>
              <textarea
                name="description"
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
                placeholder="תיאור קצר של התוכן (אופציונלי)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">קישור</label>
              <input
                name="content_url"
                type="url"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">סוג תוכן *</label>
              <select
                name="content_type"
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
              >
                <option value="video">סרטון</option>
                <option value="document">מסמך</option>
                <option value="live">שיעור חי</option>
                <option value="article">מאמר</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end pb-2.5">
              <input type="checkbox" name="cra_only" id="cra_only" className="accent-purple-600 w-4 h-4" />
              <label htmlFor="cra_only" className="text-sm font-medium text-slate-600 cursor-pointer">
                נראה רק לבוגרי CRA
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            שמור תוכן
          </button>
        </form>
      )}

      {/* Items list */}
      {items.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm">
          <div className="text-3xl mb-2">📚</div>
          <p>אין תכנים עדיין — הוסף את הראשון!</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const cfg = typeColors[item.content_type];
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4"
              style={{ border: "1.5px solid #f1f5f9" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                    {typeLabels[item.content_type]}
                  </span>
                  {item.cra_only && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.08)", color: "#7c3aed" }}>
                      CRA בלבד
                    </span>
                  )}
                  <span className="text-xs text-slate-300">{new Date(item.published_at).toLocaleDateString("he-IL")}</span>
                </div>
                <p className="font-bold text-sm" style={{ color: "#0F2645" }}>{item.title}</p>
                {item.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>}
                {item.content_url && (
                  <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-500 hover:underline mt-0.5 block truncate">
                    {item.content_url}
                  </a>
                )}
              </div>

              <form action={deleteKnowledgeItem} className="flex-shrink-0">
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
                  onClick={(e) => { if (!confirm("למחוק את הפריט?")) e.preventDefault(); }}
                >
                  מחק
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
