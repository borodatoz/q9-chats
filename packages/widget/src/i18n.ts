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

export const WEB_CHAT_COPY: Record<WebChatLocale, WebChatWidgetCopy> = {
  ru: {
    launcher: "Чат",
    close: "Закрыть",
    placeholder: "Напишите сообщение…",
    send: "Отправить",
    prechatTitle: "Представьтесь",
    name: "Имя",
    phone: "Телефон",
    email: "Email",
    start: "Начать чат",
    loading: "Подключение…",
    error: "Не удалось отправить",
    operatorTyping: "Оператор печатает…",
    offlineTitle: "Сейчас offline",
    offlineHint: "Оставьте сообщение — мы ответим, когда появимся online.",
    offlineMessageLabel: "Сообщение",
    offlineSubmit: "Отправить",
    offlineSent: "Сообщение отправлено",
    faqTitle: "Частые вопросы",
    unreadAria: (count) =>
      count > 9 ? "9+ непрочитанных сообщений" : `${count} непрочитанных`,
  },
  en: {
    launcher: "Chat",
    close: "Close",
    placeholder: "Type a message…",
    send: "Send",
    prechatTitle: "Introduce yourself",
    name: "Name",
    phone: "Phone",
    email: "Email",
    start: "Start chat",
    loading: "Connecting…",
    error: "Failed to send",
    operatorTyping: "Agent is typing…",
    offlineTitle: "We are offline",
    offlineHint: "Leave a message and we will reply when we are back online.",
    offlineMessageLabel: "Message",
    offlineSubmit: "Send",
    offlineSent: "Message sent",
    faqTitle: "FAQ",
    unreadAria: (count) =>
      count > 9 ? "9+ unread messages" : `${count} unread messages`,
  },
};

export function resolveWebChatCopy(locale: WebChatLocale): WebChatWidgetCopy {
  return WEB_CHAT_COPY[locale] ?? WEB_CHAT_COPY.ru;
}
