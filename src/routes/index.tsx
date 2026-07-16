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
  LayoutDashboard,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Tab = "dashboard" | "email" | "planner" | "chat";
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

type EmailState = {
  recipient: string;
  subject: string;
  purpose: string;
  tone: string;
  output: string;
  loading: boolean;
  error: string;
};

type PlanState = {
  tasks: string;
  hours: string;
  priorities: string;
  output: string;
  loading: boolean;
  error: string;
};

type ChatState = { messages: ChatMsg[]; input: string; loading: boolean; error: string };

function Index() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [email, setEmail] = useState<EmailState>({
    recipient: "",
    subject: "",
    purpose: "",
    tone: "Formal",
    output: "",
    loading: false,
    error: "",
  });
  const [plan, setPlan] = useState<PlanState>({
    tasks: "",
    hours: "",
    priorities: "",
    output: "",
    loading: false,
    error: "",
  });
  const [chat, setChat] = useState<ChatState>({
    messages: [],
    input: "",
    loading: false,
    error: "",
  });

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

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(chat.messages));
    } catch {
      /* ignore */
    }
  }, [chat.messages]);

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

  const navItems: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, desc: "Overview" },
    { id: "email", label: "Email Generator", icon: <Mail className="w-4 h-4" />, desc: "Compose" },
    { id: "planner", label: "Task Planner", icon: <CalendarClock className="w-4 h-4" />, desc: "Schedule" },
    { id: "chat", label: "AI Chatbot", icon: <MessageSquare className="w-4 h-4" />, desc: "Assist" },
  ];

  const titles: Record<Tab, { t: string; s: string }> = {
    dashboard: { t: "Dashboard", s: "Your AI workspace at a glance" },
    email: { t: "Smart Email Generator", s: "Compose professional emails in seconds" },
    planner: { t: "AI Task Planner", s: "Turn to-dos into a prioritized schedule" },
    chat: { t: "AI Chatbot", s: "Ask anything about work, writing, or planning" },
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={
          "fixed lg:sticky top-0 left-0 h-screen w-72 bg-surface border-r z-40 flex flex-col transition-transform duration-200 " +
          (mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >
        <div className="p-5 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand text-brand-foreground grid place-items-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold leading-tight truncate">WorkMate AI</h1>
            <p className="text-xs text-muted-foreground truncate">Productivity Assistant</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded hover:bg-surface-muted"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Workspace
          </p>
          {navItems.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setMobileOpen(false);
                }}
                className={
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition " +
                  (active
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "text-foreground/80 hover:bg-surface-muted")
                }
              >
                <span className={active ? "" : "text-muted-foreground"}>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                <span
                  className={
                    "text-[10px] uppercase tracking-wider " +
                    (active ? "text-brand-foreground/70" : "text-muted-foreground")
                  }
                >
                  {item.desc}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t">
          <div className="rounded-xl border bg-surface-muted p-3 text-xs text-muted-foreground flex gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
            <p>
              <span className="font-semibold text-foreground">Responsible AI:</span> Outputs may be
              inaccurate. Review before use. Do not share confidential data.
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur border-b">
          <div className="px-4 lg:px-8 py-4 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-muted"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="font-semibold text-lg truncate">{titles[tab].t}</h2>
              <p className="text-xs text-muted-foreground truncate">{titles[tab].s}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
          <section hidden={tab !== "dashboard"} aria-hidden={tab !== "dashboard"}>
            <DashboardPanel
              onGo={setTab}
              chatCount={chat.messages.length}
              hasEmail={!!email.output}
              hasPlan={!!plan.output}
            />
          </section>

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

          <p className="mt-8 text-center text-[11px] text-muted-foreground">
            AI can make mistakes. Verify important information before acting on it.
          </p>
        </main>
      </div>
    </div>
  );
}

function DashboardPanel({
  onGo,
  chatCount,
  hasEmail,
  hasPlan,
}: {
  onGo: (t: Tab) => void;
  chatCount: number;
  hasEmail: boolean;
  hasPlan: boolean;
}) {
  const stats = [
    { label: "Chat messages", value: chatCount, hint: "saved locally" },
    { label: "Last email draft", value: hasEmail ? "Ready" : "—", hint: "in Email tab" },
    { label: "Last schedule", value: hasPlan ? "Ready" : "—", hint: "in Planner tab" },
  ];
  const cards: { id: Tab; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: "email",
      title: "Smart Email Generator",
      desc: "Draft polished emails with the right tone in seconds.",
      icon: <Mail className="w-5 h-5" />,
    },
    {
      id: "planner",
      title: "AI Task Planner",
      desc: "Turn your to-do list into a prioritized, time-blocked plan.",
      icon: <CalendarClock className="w-5 h-5" />,
    },
    {
      id: "chat",
      title: "AI Chatbot",
      desc: "Ask questions, brainstorm, and get workplace help fast.",
      icon: <MessageSquare className="w-5 h-5" />,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-gradient-to-br from-brand to-brand/70 text-brand-foreground p-6 lg:p-8 shadow-sm">
        <p className="text-xs uppercase tracking-wider opacity-80">Welcome back</p>
        <h3 className="mt-1 text-2xl lg:text-3xl font-semibold">Let AI handle the busywork.</h3>
        <p className="mt-2 text-sm opacity-90 max-w-xl">
          Generate emails, plan your day, and chat with an assistant — all in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold mt-1">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onGo(c.id)}
            className="text-left rounded-2xl border bg-card p-5 hover:shadow-md hover:border-brand/40 transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-soft text-brand grid place-items-center mb-3 group-hover:scale-105 transition">
              {c.icon}
            </div>
            <h4 className="font-semibold">{c.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
            <p className="text-xs text-brand mt-3 font-medium">Open →</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-surface-muted p-5 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-brand shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Responsible AI notice</p>
          AI-generated content may be inaccurate or biased. Always review outputs before sending or
          acting on them. Avoid entering confidential, personal, or sensitive information.
        </div>
      </div>
    </div>
  );
}

function Card({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
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

function OutputBlock({
  text,
  loading,
  error,
}: {
  text: string;
  loading: boolean;
  error: string;
}) {
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
          {state.loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate email
        </button>
      </div>
      <OutputBlock text={state.output} loading={state.loading} error={state.error} />
    </Card>
  );
}

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
            placeholder={
              "Finish project report\nAttend team meeting\nRespond to emails\nPrepare presentation"
            }
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
          {state.loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Build my schedule
        </button>
      </div>
      <OutputBlock text={state.output} loading={state.loading} error={state.error} />
    </Card>
  );
}

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
    <Card
      title="AI Chatbot"
      subtitle="Ask anything about writing, planning, or workplace questions."
    >
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
          <div
            key={i}
            className={"flex gap-3 " + (m.role === "user" ? "justify-end" : "justify-start")}
          >
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

      {state.error && <div className="mt-3 text-sm text-destructive">{state.error}</div>}

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
