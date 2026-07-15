import { createFileRoute } from "@tanstack/react-router";
import { callGateway, type ChatMessage } from "@/lib/ai-gateway.server";

type Body =
  | { mode: "email"; recipient: string; subject: string; purpose: string; tone: string }
  | { mode: "planner"; tasks: string; hours: string; priorities: string }
  | { mode: "chat"; messages: ChatMessage[] };

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as Body;
          let messages: ChatMessage[] = [];

          if (body.mode === "email") {
            messages = [
              {
                role: "system",
                content:
                  "You are a professional email writer. Write clear, concise emails. Output only the email (subject line + body), no preamble.",
              },
              {
                role: "user",
                content: `Write an email.\nRecipient: ${body.recipient}\nSubject: ${body.subject}\nPurpose: ${body.purpose}\nTone: ${body.tone}`,
              },
            ];
          } else if (body.mode === "planner") {
            messages = [
              {
                role: "system",
                content:
                  "You are a productivity planner. Given tasks, available working hours, and priorities, produce a clear, time-blocked schedule with brief rationale. Use markdown with a table or bullet list.",
              },
              {
                role: "user",
                content: `Tasks:\n${body.tasks}\n\nWorking hours: ${body.hours}\nPriorities: ${body.priorities}\n\nProduce a prioritized daily schedule.`,
              },
            ];
          } else if (body.mode === "chat") {
            messages = [
              {
                role: "system",
                content:
                  "You are an AI workplace productivity assistant. Help employees with writing, planning, and general workplace questions. Be concise and helpful. Use markdown when useful.",
              },
              ...body.messages,
            ];
          } else {
            return new Response("Invalid mode", { status: 400 });
          }

          const text = await callGateway(messages);
          return Response.json({ text });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
