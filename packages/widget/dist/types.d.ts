import type { WebChatFaqItem, WebChatLocale } from "./i18n";
export type { WebChatFaqItem, WebChatLocale };
export interface Q9ChatWidgetProps {
    apiBase: string;
    title?: string;
    welcomeMessage?: string;
    primaryColor?: string;
    locale?: WebChatLocale;
    pollIntervalMs?: number;
    statusPollIntervalMs?: number;
    /** FAQ shown when operators are offline (disabled in widget UI for now) */
    faqItems?: WebChatFaqItem[];
    /** Force offline UI (disabled — chat is always available) */
    forceOffline?: boolean;
    /** Pre-chat name/phone form (disabled in widget UI for now) */
    showPreChatForm?: boolean;
    /**
     * Visitor id from client app session.
     * If omitted, widget loads `${apiBase}/session` (httpOnly cookie on BFF).
     */
    visitorId?: string;
}
//# sourceMappingURL=types.d.ts.map