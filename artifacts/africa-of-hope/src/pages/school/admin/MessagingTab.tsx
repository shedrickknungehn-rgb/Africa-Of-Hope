import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Mail, Send, Plus, X, ChevronLeft, Trash2, Inbox, RefreshCw } from "lucide-react";
import {
  User, Message, isManagement,
  apiGetMessages, apiGetUsers, apiSendMessage, apiMarkMessageRead, apiDeleteMessage,
} from "../schoolApi";

interface Props { currentUser: User; }

interface Thread {
  id: string;
  subject: string;
  messages: Message[];
  lastMsg: Message;
  unread: number;
  otherIds: string[];
  otherNames: string[];
}

function buildThreads(messages: Message[], myId: string): Thread[] {
  const roots = messages.filter((m) => !m.parentId);
  const replyMap = new Map<string, Message[]>();
  messages.filter((m) => m.parentId).forEach((m) => {
    const arr = replyMap.get(m.parentId) ?? [];
    arr.push(m);
    replyMap.set(m.parentId, arr);
  });
  return roots
    .map((root) => {
      const replies = replyMap.get(root.id) ?? [];
      const all = [root, ...replies].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const lastMsg = all[all.length - 1];
      const unread = all.filter((m) => m.recipientId === myId && !m.isRead).length;
      const otherIds = [...new Set(all.flatMap((m) => [m.senderId, m.recipientId]).filter((id) => id !== myId))];
      const otherNames = otherIds.map((id) => {
        const found = all.find((m) => m.senderId === id || m.recipientId === id);
        return found ? (found.senderId === id ? found.senderName : found.recipientName) : id;
      });
      return { id: root.id, subject: root.subject || "(no subject)", messages: all, lastMsg, unread, otherIds, otherNames };
    })
    .sort((a, b) => b.lastMsg.createdAt.localeCompare(a.lastMsg.createdAt));
}

export default function MessagingTab({ currentUser }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [composing, setComposing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canSeeAll = isManagement(currentUser.role);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [msgs, usrs] = await Promise.allSettled([
        apiGetMessages(showAll && canSeeAll ? { all: true } : undefined),
        apiGetUsers(),
      ]);
      if (msgs.status === "fulfilled") setMessages(msgs.value);
      if (usrs.status === "fulfilled") setUsers(usrs.value);
    } finally {
      setLoading(false);
    }
  }, [showAll, canSeeAll]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), 10_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]);

  const threads = useMemo(() => buildThreads(messages, currentUser.id), [messages, currentUser.id]);
  const selectedThread = threads.find((t) => t.id === selectedId) ?? null;
  const totalUnread = messages.filter((m) => m.recipientId === currentUser.id && !m.isRead).length;

  const openThread = async (thread: Thread) => {
    setSelectedId(thread.id);
    setMobileView("thread");
    const unread = thread.messages.filter((m) => m.recipientId === currentUser.id && !m.isRead);
    for (const msg of unread) {
      await apiMarkMessageRead(msg.id).catch(() => {});
    }
    if (unread.length > 0) load(true);
  };

  const deleteMsg = async (id: string) => {
    await apiDeleteMessage(id).catch(() => {});
    load(true);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="flex gap-0 h-[calc(100vh-180px)] min-h-[400px] bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* ── Thread list (left panel) ── */}
      <div className={`flex flex-col w-full md:w-72 lg:w-80 border-r border-gray-100 flex-shrink-0 ${mobileView === "thread" ? "hidden md:flex" : "flex"}`}>
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-[#f7f5f0]">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#1a6b2a]" />
            <span className="font-black text-[#0f0f0f] text-sm">
              Inbox
              {totalUnread > 0 && <span className="ml-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{totalUnread}</span>}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {canSeeAll && (
              <button onClick={() => setShowAll((v) => !v)} title={showAll ? "Show my messages" : "Show all messages"}
                className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-colors ${showAll ? "bg-[#d4a017] text-white border-[#d4a017]" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                {showAll ? "ALL" : "MINE"}
              </button>
            )}
            <button onClick={() => load(true)} className="p-1.5 text-gray-400 hover:text-[#1a6b2a] rounded-lg hover:bg-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setComposing(true); }} className="flex items-center gap-1 bg-[#1a6b2a] hover:bg-[#155a22] text-white text-[11px] font-black px-2.5 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3 h-3" />New
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && threads.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Loading…</div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
              <Mail className="w-8 h-8 opacity-30" />
              <p className="text-sm font-medium">No messages yet</p>
            </div>
          ) : (
            threads.map((thread) => (
              <button key={thread.id} onClick={() => openThread(thread)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors hover:bg-[#f7f5f0] touch-manipulation ${selectedId === thread.id ? "bg-[#f0f7f1] border-l-2 border-l-[#1a6b2a]" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm truncate flex-1 ${thread.unread > 0 ? "font-black text-[#0f0f0f]" : "font-medium text-gray-700"}`}>
                    {thread.otherNames.join(", ") || "Me"}
                  </p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{formatTime(thread.lastMsg.createdAt)}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${thread.unread > 0 ? "font-bold text-[#0f0f0f]" : "text-gray-500"}`}>
                  {thread.subject}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{thread.lastMsg.body}</p>
                {thread.unread > 0 && (
                  <span className="inline-block mt-1 bg-[#1a6b2a] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{thread.unread} new</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Thread view (right panel) ── */}
      <div className={`flex-1 flex flex-col overflow-hidden ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
        {!selectedThread ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Mail className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">Select a conversation</p>
            <button onClick={() => setComposing(true)} className="flex items-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] text-white font-black text-sm px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" />Compose New Message
            </button>
          </div>
        ) : (
          <ThreadView
            thread={selectedThread}
            currentUser={currentUser}
            onBack={() => { setMobileView("list"); setSelectedId(null); }}
            onDelete={deleteMsg}
            onReply={async (body) => {
              await apiSendMessage({ recipientId: selectedThread.otherIds[0], subject: selectedThread.subject, body, parentId: selectedThread.id });
              load(true);
            }}
            formatTime={formatTime}
          />
        )}
      </div>

      {composing && (
        <ComposeModal
          currentUser={currentUser}
          users={users}
          onClose={() => setComposing(false)}
          onSend={async (recipientId, subject, body) => {
            await apiSendMessage({ recipientId, subject, body });
            setComposing(false);
            load(true);
          }}
        />
      )}
    </div>
  );
}

/* ─── Thread view ─────────────────────────────────────────────── */
function ThreadView({ thread, currentUser, onBack, onDelete, onReply, formatTime }: {
  thread: Thread; currentUser: User;
  onBack: () => void;
  onDelete: (id: string) => void;
  onReply: (body: string) => Promise<void>;
  formatTime: (iso: string) => string;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread.messages.length]);

  const send = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try { await onReply(reply.trim()); setReply(""); }
    finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-[#f7f5f0] flex-shrink-0">
        <button onClick={onBack} className="md:hidden p-1 text-gray-500 hover:text-[#0f0f0f] touch-manipulation"><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[#0f0f0f] text-sm truncate">{thread.subject}</p>
          <p className="text-[11px] text-gray-400">{thread.otherNames.join(", ")} · {thread.messages.length} message{thread.messages.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {thread.messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${isMe ? "bg-[#1a6b2a]" : "bg-blue-500"}`}>
                {msg.senderName.slice(0, 1).toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  <span className="text-[11px] font-bold text-gray-500">{isMe ? "You" : msg.senderName}</span>
                  <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                </div>
                <div className={`rounded-2xl px-4 py-2.5 text-sm group relative ${isMe ? "bg-[#1a6b2a] text-white rounded-tr-sm" : "bg-[#f7f5f0] text-[#0f0f0f] rounded-tl-sm"}`}>
                  {msg.body}
                  <button onClick={() => onDelete(msg.id)}
                    className={`absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-red-500"}`}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0 bg-white">
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Reply… (Enter to send, Shift+Enter for new line)"
            className="flex-1 bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b2a]/30"
          />
          <button onClick={send} disabled={sending || !reply.trim()}
            className="flex items-center justify-center gap-1.5 bg-[#1a6b2a] hover:bg-[#155a22] disabled:opacity-40 text-white font-black px-3 rounded-xl transition-colors touch-manipulation flex-shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Compose modal ───────────────────────────────────────────── */
function ComposeModal({ currentUser, users, onClose, onSend }: {
  currentUser: User; users: User[];
  onClose: () => void;
  onSend: (recipientId: string, subject: string, body: string) => Promise<void>;
}) {
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const recipients = users.filter((u) => u.id !== currentUser.id && u.isActive !== false);

  const send = async () => {
    if (!recipientId) { setErr("Please select a recipient"); return; }
    if (!body.trim()) { setErr("Message body required"); return; }
    setSending(true); setErr("");
    try { await onSend(recipientId, subject, body.trim()); }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed to send"); setSending(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-[#0f0f0f]">New Message</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-[#0f0f0f] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
            <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)}
              className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm">
              <option value="">Select recipient…</option>
              {recipients.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="(optional)"
              className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message…"
              className="w-full bg-[#f7f5f0] border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b2a]/30" />
          </div>
          {err && <p className="text-sm font-bold text-red-600">{err}</p>}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
          <button onClick={send} disabled={sending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1a6b2a] hover:bg-[#155a22] disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-sm transition-colors touch-manipulation">
            <Send className="w-4 h-4" />{sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
