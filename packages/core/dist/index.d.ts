export type WebChatIntegrationMethodId = "communication.web-chat-session-start" | "communication.web-chat-session-resume" | "communication.web-chat-messages-list" | "communication.web-chat-message-send" | "communication.web-chat-visitor-update" | "communication.web-chat-status-get" | "communication.web-chat-typing-set";
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
export declare function createVisitorId(): string;
export declare function getOrCreateVisitorId(storage?: Storage | null): string;
export declare class WebChatClient {
    private readonly apiBase;
    private readonly fetchImpl;
    constructor(options: WebChatClientOptions);
    startSession(args: {
        visitorId: string;
        pageUrl?: string;
        metadata?: Record<string, unknown>;
    }): Promise<WebChatSession>;
    resumeSession(args: {
        visitorId: string;
        pageUrl?: string;
    }): Promise<WebChatSession | null>;
    listMessages(session: WebChatSession, args?: {
        since?: string;
        limit?: number;
    }): Promise<WebChatMessage[]>;
    sendMessage(session: WebChatSession, text: string): Promise<WebChatMessage>;
    updateVisitor(session: WebChatSession, profile: WebChatVisitorProfile): Promise<void>;
    getStatus(session: WebChatSession): Promise<WebChatStatus>;
    setTyping(session: WebChatSession, isTyping: boolean): Promise<void>;
    private invoke;
}
export { WebChatClient as default };
//# sourceMappingURL=index.d.ts.map