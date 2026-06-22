export type Q9ChatsLoaderInitOptions = {
  apiBase: string;
  title?: string;
  primaryColor?: string;
  locale?: "ru" | "en";
};

declare global {
  interface Window {
    Q9Chats?: {
      init: (options: Q9ChatsLoaderInitOptions) => void;
    };
  }
}

/**
 * Non-React bootstrap. Loads a minimal iframe shell pointing at your hosted widget page,
 * or integrate @q9/chats-widget in your React app instead.
 */
export function initQ9ChatsLoader(options: Q9ChatsLoaderInitOptions): void {
  if (typeof document === "undefined") return;

  const existing = document.getElementById("q9-chats-loader-root");
  if (existing) return;

  const root = document.createElement("div");
  root.id = "q9-chats-loader-root";
  document.body.appendChild(root);

  const note = document.createElement("div");
  note.textContent =
    "Q9 Chats loader: use @q9/chats-widget in React/Next or host a widget page.";
  note.style.cssText =
    "position:fixed;right:20px;bottom:20px;padding:8px 12px;background:#111;color:#fff;font:12px sans-serif;border-radius:8px;opacity:.85;z-index:2147483000";
  root.appendChild(note);

  console.info("[@q9/chats-loader] init", options);
}

if (typeof window !== "undefined") {
  window.Q9Chats = {
    init: initQ9ChatsLoader,
  };
}
