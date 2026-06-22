export type WebChatIntegrationMethodId =
  | "communication.web-chat-session-start"
  | "communication.web-chat-session-resume"
  | "communication.web-chat-messages-list"
  | "communication.web-chat-message-send"
  | "communication.web-chat-visitor-update"
  | "communication.web-chat-status-get"
  | "communication.web-chat-typing-set";

export type WebChatSession = {
  visitor_id: string;
  conversation_id: string;
  client_id: string;
  participant_id: string;
  channel_id: string;
  created?: boolean;
};

export type WebChatMessage = {
  id: string;
  text: string | null;
  direction: string;
  status: string;
  created_at: string;
  sender_participant_id: string | null;
};

export type WebChatVisitorProfile = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
};

export type WebChatStatus = {
  operators_online: boolean;
  operator_typing: boolean;
  visitor_typing: boolean;
};

export type WebChatInvokeResponse<T> = {
  ok: boolean;
  error?: string;
  session?: WebChatSession;
  messages?: WebChatMessage[];
  message?: WebChatMessage;
  client_id?: string;
  main_id?: string | null;
} & T;

export type WebChatClientOptions = {
  /** Base URL of the site BFF, e.g. `/api/q9-chat` */
  apiBase: string;
  fetchImpl?: typeof fetch;
};

const VISITOR_STORAGE_KEY = "q9_chat_visitor_id";

export function createVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `v_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  return `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function getOrCreateVisitorId(storage?: Storage | null): string {
  const store =
    storage ??
    (typeof localStorage !== "undefined" ? localStorage : null);
  if (!store) return createVisitorId();

  const existing = store.getItem(VISITOR_STORAGE_KEY);
  if (existing && existing.length >= 8) return existing;

  const next = createVisitorId();
  store.setItem(VISITOR_STORAGE_KEY, next);
  return next;
}

/** Visitor id from site BFF session cookie (`GET ${apiBase}/session`). */
export async function resolveWebChatVisitorId(
  apiBase: string,
  fetchImpl: typeof fetch = fetch.bind(globalThis),
): Promise<string> {
  const base = apiBase.replace(/\/$/, "");
  const response = await fetchImpl(`${base}/session`, {
    credentials: "same-origin",
  });
  const json = (await response.json().catch(() => ({}))) as {
    visitor_id?: string;
  };
  const visitorId = json.visitor_id?.trim();
  if (!response.ok || !visitorId || visitorId.length < 8) {
    throw new Error("web_chat_session_required");
  }
  return visitorId;
}

export class WebChatClient {
  private readonly apiBase: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: WebChatClientOptions) {
    this.apiBase = options.apiBase.replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
  }

  async startSession(args: {
    visitorId: string;
    pageUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<WebChatSession> {
    const body = await this.invoke<{ session: WebChatSession }>(
      "communication.web-chat-session-start",
      {
        session: {
          visitor_id: args.visitorId,
          page_url: args.pageUrl ?? null,
          ...(args.metadata ? { metadata: args.metadata } : {}),
        },
      },
    );
    if (!body.ok || !body.session) {
      throw new Error(body.error ?? "session_start_failed");
    }
    return body.session;
  }

  async resumeSession(args: {
    visitorId: string;
    pageUrl?: string;
  }): Promise<WebChatSession | null> {
    const body = await this.invoke<{ session: WebChatSession }>(
      "communication.web-chat-session-resume",
      {
        session: {
          visitor_id: args.visitorId,
          page_url: args.pageUrl ?? null,
        },
      },
    );
    if (!body.ok) {
      if (body.error === "session_not_found") return null;
      throw new Error(body.error ?? "session_resume_failed");
    }
    return body.session ?? null;
  }

  async listMessages(
    session: WebChatSession,
    args?: { since?: string; limit?: number },
  ): Promise<WebChatMessage[]> {
    const body = await this.invoke<{ messages: WebChatMessage[] }>(
      "communication.web-chat-messages-list",
      {
        query: {
          visitor_id: session.visitor_id,
          conversation_id: session.conversation_id,
          participant_id: session.participant_id,
          since: args?.since ?? null,
          limit: args?.limit ?? null,
        },
      },
    );
    if (!body.ok) {
      throw new Error(body.error ?? "messages_list_failed");
    }
    return body.messages ?? [];
  }

  async sendMessage(session: WebChatSession, text: string): Promise<WebChatMessage> {
    const body = await this.invoke<{ message: WebChatMessage }>(
      "communication.web-chat-message-send",
      {
        message: {
          visitor_id: session.visitor_id,
          conversation_id: session.conversation_id,
          participant_id: session.participant_id,
          text,
        },
      },
    );
    if (!body.ok || !body.message) {
      throw new Error(body.error ?? "message_send_failed");
    }
    return body.message;
  }

  async updateVisitor(
    session: WebChatSession,
    profile: WebChatVisitorProfile,
  ): Promise<void> {
    const body = await this.invoke("communication.web-chat-visitor-update", {
      visitor: {
        visitor_id: session.visitor_id,
        conversation_id: session.conversation_id,
        participant_id: session.participant_id,
        ...profile,
      },
    });
    if (!body.ok) {
      throw new Error(body.error ?? "visitor_update_failed");
    }
  }

  async getStatus(session: WebChatSession): Promise<WebChatStatus> {
    const body = await this.invoke<{ status: WebChatStatus }>(
      "communication.web-chat-status-get",
      {
        query: {
          visitor_id: session.visitor_id,
          conversation_id: session.conversation_id,
          participant_id: session.participant_id,
        },
      },
    );
    if (!body.ok || !body.status) {
      throw new Error(body.error ?? "status_get_failed");
    }
    return body.status;
  }

  async setTyping(session: WebChatSession, isTyping: boolean): Promise<void> {
    const body = await this.invoke("communication.web-chat-typing-set", {
      typing: {
        visitor_id: session.visitor_id,
        conversation_id: session.conversation_id,
        participant_id: session.participant_id,
        is_typing: isTyping,
      },
    });
    if (!body.ok) {
      throw new Error(body.error ?? "typing_set_failed");
    }
  }

  private async invoke<T>(
    method: WebChatIntegrationMethodId,
    params: Record<string, unknown>,
  ): Promise<WebChatInvokeResponse<T>> {
    const response = await this.fetchImpl(this.apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, params }),
    });

    const json = (await response.json().catch(() => ({}))) as WebChatInvokeResponse<T>;
    if (!response.ok && json.ok !== false) {
      return { ok: false, error: `http_${response.status}` } as WebChatInvokeResponse<T>;
    }
    return json;
  }
}

export { WebChatClient as default };
