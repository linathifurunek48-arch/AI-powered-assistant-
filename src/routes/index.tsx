import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Mail,
  CalendarClock,
  MessageSquare,
  Sparkles,
  Send,
  Copy,
  Check,
  Loader2,
  Trash2,
  Bot,
  User,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Tab = "email" | "planner" | "chat";
type ChatMsg = { role: "user" | "assistant"; content: string };

const CHAT_KEY = "workmate.chat.v1";
const EMAIL_KEY = "workmate.email.v1";
const PLAN_KEY = "workmate.plan.v1";

async function callAI(body: unknown): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { text?: string; error?: string };
  if (!res.ok || data.error) throw new Error(data.error || "Request failed");
  return data.text ?? "";
}

function Index() {
  const [tab, setTab] = useState<Tab>("email");

  // Lifted state — persists across tab switches because Index never unmounts.
  const [email, setEmail] = useState({
    recipient: "",
    subject: "",
    purpose: "",
    tone: "Formal",
    output: "",
    loading: false,
    error: "",
  });
  const [plan, setPlan] = useState({
    tasks: "",
    hours: "",
    priorities: "",
    output: "",
    loading: false,
    error: "",
  });
  const [chat, setChat] = useState<{
    messages: ChatMsg[];
    input: string;
    loading: boolean;
    error: string;
  }>({ messages: [], input: "", loading: false, error: "" });

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const c = localStorage.getItem(CHAT_KEY);
      if (c) {
        const parsed = JSON.parse(c) as ChatMsg[];
        if (Array.isArray(parsed)) setChat((s) => ({ ...s, messages: parsed }));
      }
      const e = localStorage.getItem(EMAIL_KEY);
      if (e) setEmail((s) => ({ ...s, ...JSON.parse(e), loading: false, error: "" }));
      const p = localStorage.getItem(PLAN_KEY);
      if (p) setPlan((s) => ({ ...s, ...JSON.parse(p), loading: false, error: "" }));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist chat messages.
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(chat.messages));
    } catch {
      /* ignore */
    }
  }, [chat.messages]);

  // Persist email form (excluding transient flags).
  useEffect(() => {
    const { recipient, subject, purpose, tone, output } = email;
    try {
      localStorage.setItem(
        EMAIL_KEY,
        JSON.stringify({ recipient, subject, purpose, tone, output }),
      );
    } catch {
      /* ignore */
    }
  }, [email]);

  useEffect(() => {
    const { tasks, hours, priorities, output } = plan;
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify({ tasks, hours, priorities, output }));
    } catch {
      /* ignore */
    }
  }, [plan]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand text-brand-foreground grid place-items-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight">WorkMate AI</h1>
              <p className="text-xs text-muted-foreground">Workplace productivity assistant</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-surface-muted rounded-full p-1">
            <TabBtn active={tab === "email"} onClick={() => setTab("email")} icon={<Mail className="w-4 h-4" />} label="Email" />
            <TabBtn active={tab === "planner"} onClick={() => setTab("planner")} icon={<CalendarClock className="w-4 h-4" />} label="Planner" />
            <TabBtn active={tab === "chat"} onClick={() => setTab("chat")} icon={<MessageSquare className="w-4 h-4" />} label="Chat" />
          </nav>
        </div>
        <nav className="md:hidden max-w-6xl mx-auto px-6 pb-3 flex items-center gap-1 overflow-x-auto">
          <TabBtn active={tab === "email"} onClick={() => setTab("email")} icon={<Mail className="w-4 h-4" />} label="Email" />
          <TabBtn active={tab === "planner"} onClick={() => setTab("planner")} icon={<CalendarClock className="w-4 h-4" />} label="Planner" />
          <TabBtn active={tab === "chat"} onClick={() => setTab("chat")} icon={<MessageSquare className="w-4 h-4" />} label="Chat" />
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Render all panels but hide inactive ones — this way inputs never unmount even without lifted state. */}
        <section hidden={tab !== "email"} aria-hidden={tab !== "email"}>
          <EmailPanel
            state={email}
            setState={setEmail}
            onGenerate={async () => {
              setEmail((s) => ({ ...s, loading: true, error: "", output: "" }));
              try {
                const text = await callAI({
                  mode: "email",
                  recipient: email.recipient,
                  subject: email.subject,
                  purpose: email.purpose,
                  tone: email.tone,
                });
                setEmail((s) => ({ ...s, loading: false, output: text }));
              } catch (err) {
                setEmail((s) => ({
                  ...s,
                  loading: false,
                  error: err instanceof Error ? err.message : "Failed",
                }));
              }
            }}
          />
        </section>

        <section hidden={tab !== "planner"} aria-hidden={tab !== "planner"}>
          <PlannerPanel
            state={plan}
            setState={setPlan}
            onGenerate={async () => {
              setPlan((s) => ({ ...s, loading: true, error: "", output: "" }));
              try {
                const text = await callAI({
                  mode: "planner",
                  tasks: plan.tasks,
                  hours: plan.hours,
                  priorities: plan.priorities,
                });
                setPlan((s) => ({ ...s, loading: false, output: text }));
              } catch (err) {
                setPlan((s) => ({
                  ...s,
                  loading: false,
                  error: err instanceof Error ? err.message : "Failed",
                }));
              }
            }}
          />
        </section>

        <section hidden={tab !== "chat"} aria-hidden={tab !== "chat"}>
          <ChatPanel
            state={chat}
            setState={setChat}
            active={tab === "chat"}
            onSend={async () => {
              const text = chat.input.trim();
              if (!text || chat.loading) return;
              const next = [...chat.messages, { role: "user" as const, content: text }];
              setChat((s) => ({ ...s, messages: next, input: "", loading: true, error: "" }));
              try {
                const reply = await callAI({ mode: "chat", messages: next });
                setChat((s) => ({
                  ...s,
                  messages: [...next, { role: "assistant", content: reply }],
                  loading: false,
                }));
              } catch (err) {
                setChat((s) => ({
                  ...s,
                  loading: false,
                  error: err instanceof Error ? err.message : "Failed",
                }));
              }
            }}
            onClear={() => setChat({ messages: [], input: "", loading: false, error: "" })}
          />
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-xs text-muted-foreground text-center">
        Your work stays here — chat and drafts persist across tabs and refreshes.
      </footer>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap " +
        (active
          ? "bg-brand text-brand-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {icon}
      {label}
    </button>
  );
}

function Card({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="bg-card rounded-2xl border shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition";

function OutputBlock({ text, loading, error }: { text: string; loading: boolean; error: string }) {
  const [copied, setCopied] = useState(false);
  if (loading)
    return (
      <div className="mt-6 rounded-xl border bg-surface-muted p-6 flex items-center gap-3 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Generating…
      </div>
    );
  if (error)
    return (
      <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive p-4 text-sm">
        {error}
      </div>
    );
  if (!text) return null;
  return (
    <div className="mt-6 rounded-xl border bg-surface-muted">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs font-medium text-muted-foreground">AI OUTPUT</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs flex items-center gap-1.5 px-2 py-1 rounded hover:bg-background transition"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  );
}

type EmailState = {
  recipient: string;
  subject: string;
  purpose: string;
  tone: string;
  output: string;
  loading: boolean;
  error: string;
};

function EmailPanel({
  state,
  setState,
  onGenerate,
}: {
  state: EmailState;
  setState: React.Dispatch<React.SetStateAction<EmailState>>;
  onGenerate: () => void;
}) {
  return (
    <Card
      title="Smart Email Generator"
      subtitle="Compose professional emails in seconds with the right tone."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Recipient">
          <input
            className={inputCls}
            value={state.recipient}
            onChange={(e) => setState((s) => ({ ...s, recipient: e.target.value }))}
            placeholder="e.g. Client, Manager, Team"
          />
        </Field>
        <Field label="Subject">
          <input
            className={inputCls}
            value={state.subject}
            onChange={(e) => setState((s) => ({ ...s, subject: e.target.value }))}
            placeholder="Project update"
          />
        </Field>
        <Field label="Tone">
          <select
            className={inputCls}
            value={state.tone}
            onChange={(e) => setState((s) => ({ ...s, tone: e.target.value }))}
          >
            <option>Formal</option>
            <option>Friendly</option>
            <option>Persuasive</option>
            <option>Apologetic</option>
            <option>Concise</option>
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Purpose">
            <textarea
              className={inputCls + " min-h-[110px] resize-y"}
              value={state.purpose}
              onChange={(e) => setState((s) => ({ ...s, purpose: e.target.value }))}
              placeholder="What is the email about? Any key points to include?"
            />
          </Field>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={state.loading || !state.purpose.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand text-brand-foreground px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {state.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate email
        </button>
      </div>
      <OutputBlock text={state.output} loading={state.loading} error={state.error} />
    </Card>
  );
}

type PlanState = {
  tasks: string;
  hours: string;
  priorities: string;
  output: string;
  loading: boolean;
  error: string;
};

function PlannerPanel({
  state,
  setState,
  onGenerate,
}: {
  state: PlanState;
  setState: React.Dispatch<React.SetStateAction<PlanState>>;
  onGenerate: () => void;
}) {
  return (
    <Card
      title="AI Task Planner"
      subtitle="Turn your to-do list into a prioritized, time-blocked schedule."
    >
      <div className="grid gap-4">
        <Field label="Tasks (one per line)">
          <textarea
            className={inputCls + " min-h-[140px] resize-y"}
            value={state.tasks}
            onChange={(e) => setState((s) => ({ ...s, tasks: e.target.value }))}
            placeholder={"Finish project report\nAttend team meeting\nRespond to emails\nPrepare presentation"}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Working hours">
            <input
              className={inputCls}
              value={state.hours}
              onChange={(e) => setState((s) => ({ ...s, hours: e.target.value }))}
              placeholder="9:00–17:00"
            />
          </Field>
          <Field label="Priorities">
            <input
              className={inputCls}
              value={state.priorities}
              onChange={(e) => setState((s) => ({ ...s, priorities: e.target.value }))}
              placeholder="Report is most urgent; meeting at 2pm"
            />
          </Field>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={state.loading || !state.tasks.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand text-brand-foreground px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {state.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Build my schedule
        </button>
      </div>
      <OutputBlock text={state.output} loading={state.loading} error={state.error} />
    </Card>
  );
}

type ChatState = { messages: ChatMsg[]; input: string; loading: boolean; error: string };

function ChatPanel({
  state,
  setState,
  onSend,
  onClear,
  active,
}: {
  state: ChatState;
  setState: React.Dispatch<React.SetStateAction<ChatState>>;
  onSend: () => void;
  onClear: () => void;
  active: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, state.loading]);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  return (
    <Card title="AI Chatbot" subtitle="Ask anything about writing, planning, or workplace questions.">
      <div className="flex items-center justify-between -mt-2 mb-3">
        <span className="text-xs text-muted-foreground">
          {state.messages.length} message{state.messages.length === 1 ? "" : "s"} • saved locally
        </span>
        {state.messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-destructive transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="h-[420px] overflow-y-auto rounded-xl border bg-surface-muted p-4 space-y-4"
      >
        {state.messages.length === 0 && (
          <div className="h-full grid place-items-center text-center text-sm text-muted-foreground">
            <div>
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-60" />
              Start a conversation. Try “Draft a Slack update about the release delay.”
            </div>
          </div>
        )}
        {state.messages.map((m, i) => (
          <div key={i} className={"flex gap-3 " + (m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-brand text-brand-foreground grid place-items-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed " +
                (m.role === "user"
                  ? "bg-brand text-brand-foreground rounded-br-sm"
                  : "bg-surface border rounded-bl-sm")
              }
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground grid place-items-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {state.loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-brand text-brand-foreground grid place-items-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-surface border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {state.error && (
        <div className="mt-3 text-sm text-destructive">{state.error}</div>
      )}

      <div className="mt-4 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={state.input}
          onChange={(e) => setState((s) => ({ ...s, input: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          placeholder="Ask your workplace assistant…"
          className={inputCls + " resize-none min-h-[44px] max-h-40"}
        />
        <button
          onClick={onSend}
          disabled={state.loading || !state.input.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand text-brand-foreground px-4 h-11 text-sm font-medium shadow-sm hover:opacity-90 transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </Card>
  );
}
