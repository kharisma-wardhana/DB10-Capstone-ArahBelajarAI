import { API_BASE_URL, API } from "@/shared/api/endpoints";
import type { SSEDoneEvent } from "@/shared/api/types";

export async function streamInterviewChat(
  sessionId: string,
  message: string,
  onToken: (token: string) => void,
  onDone: (meta: SSEDoneEvent) => void,
  onError: (error: Error) => void,
): Promise<void> {
  const url = `${API_BASE_URL}${API.INTERVIEW_CHAT(sessionId)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`SSE request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr);
          if ("done" in event && event.done) {
            onDone(event as SSEDoneEvent);
          } else if ("token" in event) {
            onToken(event.token);
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
