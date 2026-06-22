import { Q9ChatWidget } from "@q9/chats-widget";
import "@q9/chats-widget/styles.css";

export default function HomePage() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 32 }}>
      <h1>Q9 Web Chat — example site</h1>
      <p>
        Widget talks to <code>/api/q9-chat</code> (BFF). Configure{" "}
        <code>Q9_ADMIN_URL</code> and <code>Q9_CHAT_API_KEY</code> in{" "}
        <code>.env.local</code>.
      </p>
      <Q9ChatWidget
        apiBase="/api/q9-chat"
        title="Поддержка"
        welcomeMessage="Здравствуйте! Чем можем помочь?"
        showPreChatForm
        primaryColor="#2563eb"
        locale="ru"
        faqItems={[
          {
            question: "Как связаться с поддержкой?",
            answer: "Оставьте сообщение — мы ответим в рабочее время.",
          },
          {
            question: "Где посмотреть статус заказа?",
            answer: "Напишите номер заказа в чат или на email из письма.",
          },
        ]}
      />
    </main>
  );
}
