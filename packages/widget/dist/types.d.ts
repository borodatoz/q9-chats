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
    showPreChatForm?: boolean;
    /** FAQ shown when operators are offline */
    faqItems?: WebChatFaqItem[];
    /** Force offline UI (skip online check) */
    forceOffline?: boolean;
}
//# sourceMappingURL=types.d.ts.map