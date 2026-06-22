export type WebChatLocale = "ru" | "en";
export type WebChatFaqItem = {
    question: string;
    answer: string;
};
export type WebChatWidgetCopy = {
    launcher: string;
    close: string;
    placeholder: string;
    send: string;
    prechatTitle: string;
    name: string;
    phone: string;
    email: string;
    start: string;
    loading: string;
    error: string;
    operatorTyping: string;
    offlineTitle: string;
    offlineHint: string;
    offlineMessageLabel: string;
    offlineSubmit: string;
    offlineSent: string;
    faqTitle: string;
    unreadAria: (count: number) => string;
};
export declare const WEB_CHAT_COPY: Record<WebChatLocale, WebChatWidgetCopy>;
export declare function resolveWebChatCopy(locale: WebChatLocale): WebChatWidgetCopy;
//# sourceMappingURL=i18n.d.ts.map