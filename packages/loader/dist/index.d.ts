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
export declare function initQ9ChatsLoader(options: Q9ChatsLoaderInitOptions): void;
