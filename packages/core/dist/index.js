const VISITOR_STORAGE_KEY = "q9_chat_visitor_id";
export function createVisitorId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `v_${crypto.randomUUID().replace(/-/g, "")}`;
    }
    return `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
export function getOrCreateVisitorId(storage) {
    const store = storage ??
        (typeof localStorage !== "undefined" ? localStorage : null);
    if (!store)
        return createVisitorId();
    const existing = store.getItem(VISITOR_STORAGE_KEY);
    if (existing && existing.length >= 8)
        return existing;
    const next = createVisitorId();
    store.setItem(VISITOR_STORAGE_KEY, next);
    return next;
}
/** Visitor id from site BFF session cookie (`GET ${apiBase}/session`). */
export async function resolveWebChatVisitorId(apiBase, fetchImpl = fetch.bind(globalThis)) {
    const base = apiBase.replace(/\/$/, "");
    const response = await fetchImpl(`${base}/session`, {
        credentials: "same-origin",
    });
    const json = (await response.json().catch(() => ({})));
    const visitorId = json.visitor_id?.trim();
    if (!response.ok || !visitorId || visitorId.length < 8) {
        throw new Error("web_chat_session_required");
    }
    return visitorId;
}
export class WebChatClient {
    apiBase;
    fetchImpl;
    constructor(options) {
        this.apiBase = options.apiBase.replace(/\/$/, "");
        this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
    }
    async startSession(args) {
        const body = await this.invoke("communication.web-chat-session-start", {
            session: {
                visitor_id: args.visitorId,
                page_url: args.pageUrl ?? null,
                ...(args.metadata ? { metadata: args.metadata } : {}),
            },
        });
        if (!body.ok || !body.session) {
            throw new Error(body.error ?? "session_start_failed");
        }
        return body.session;
    }
    async resumeSession(args) {
        const body = await this.invoke("communication.web-chat-session-resume", {
            session: {
                visitor_id: args.visitorId,
                page_url: args.pageUrl ?? null,
            },
        });
        if (!body.ok) {
            if (body.error === "session_not_found")
                return null;
            throw new Error(body.error ?? "session_resume_failed");
        }
        return body.session ?? null;
    }
    async listMessages(session, args) {
        const body = await this.invoke("communication.web-chat-messages-list", {
            query: {
                visitor_id: session.visitor_id,
                conversation_id: session.conversation_id,
                participant_id: session.participant_id,
                since: args?.since ?? null,
                limit: args?.limit ?? null,
            },
        });
        if (!body.ok) {
            throw new Error(body.error ?? "messages_list_failed");
        }
        return body.messages ?? [];
    }
    async sendMessage(session, text) {
        const body = await this.invoke("communication.web-chat-message-send", {
            message: {
                visitor_id: session.visitor_id,
                conversation_id: session.conversation_id,
                participant_id: session.participant_id,
                text,
            },
        });
        if (!body.ok || !body.message) {
            throw new Error(body.error ?? "message_send_failed");
        }
        return body.message;
    }
    async updateVisitor(session, profile) {
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
    async getStatus(session) {
        const body = await this.invoke("communication.web-chat-status-get", {
            query: {
                visitor_id: session.visitor_id,
                conversation_id: session.conversation_id,
                participant_id: session.participant_id,
            },
        });
        if (!body.ok || !body.status) {
            throw new Error(body.error ?? "status_get_failed");
        }
        return body.status;
    }
    async setTyping(session, isTyping) {
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
    async invoke(method, params) {
        const response = await this.fetchImpl(this.apiBase, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method, params }),
        });
        const json = (await response.json().catch(() => ({})));
        if (!response.ok && json.ok !== false) {
            return { ok: false, error: `http_${response.status}` };
        }
        return json;
    }
}
export { WebChatClient as default };
