"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { resolveWebChatVisitorId, WebChatClient, } from "@q9/chats-core";
import { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { resolveWebChatCopy } from "./i18n";
function isMine(message, session) {
    if (!session)
        return message.direction === "inbound";
    return message.sender_participant_id === session.participant_id;
}
function mergeMessages(prev, fresh) {
    if (fresh.length === 0)
        return prev;
    const ids = new Set(prev.map((m) => m.id));
    const merged = [...prev];
    for (const message of fresh) {
        if (!ids.has(message.id))
            merged.push(message);
    }
    return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}
function countUnreadFromThem(messages, session, lastReadAt) {
    if (!session || !lastReadAt) {
        return messages.filter((m) => !isMine(m, session)).length;
    }
    const since = Date.parse(lastReadAt);
    return messages.filter((m) => {
        if (isMine(m, session))
            return false;
        return Date.parse(m.created_at) > since;
    }).length;
}
export function Q9ChatWidget({ apiBase, title = "Support", welcomeMessage, primaryColor, locale = "ru", pollIntervalMs = 4000, statusPollIntervalMs = 2500, 
// showPreChatForm = false,
// faqItems = [],
// forceOffline = false,
visitorId: visitorIdProp, }) {
    const t = resolveWebChatCopy(locale);
    const client = useMemo(() => new WebChatClient({ apiBase }), [apiBase]);
    const visitorIdRef = useRef(visitorIdProp ?? null);
    const typingStopRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatStatus, setChatStatus] = useState(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastReadAt, setLastReadAt] = useState(null);
    // Pre-chat / offline forms disabled — chat is always open for messages.
    // const [preChatDone, setPreChatDone] = useState(!showPreChatForm);
    // const [preChatName, setPreChatName] = useState("");
    // const [preChatPhone, setPreChatPhone] = useState("");
    // const [offlineSent, setOfflineSent] = useState(false);
    // const [offlineName, setOfflineName] = useState("");
    // const [offlineEmail, setOfflineEmail] = useState("");
    // const [offlinePhone, setOfflinePhone] = useState("");
    // const [offlineText, setOfflineText] = useState("");
    // const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const lastMessageAt = messages.at(-1)?.created_at;
    const operatorTyping = chatStatus?.operator_typing === true;
    const unreadCount = open
        ? 0
        : countUnreadFromThem(messages, session, lastReadAt);
    const resolveVisitorId = useCallback(async () => {
        if (visitorIdProp)
            return visitorIdProp;
        if (visitorIdRef.current)
            return visitorIdRef.current;
        const visitorId = await resolveWebChatVisitorId(apiBase);
        visitorIdRef.current = visitorId;
        return visitorId;
    }, [apiBase, visitorIdProp]);
    const ensureSession = useCallback(async () => {
        if (session)
            return session;
        const visitorId = await resolveVisitorId();
        setLoading(true);
        try {
            const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;
            const resumed = await client.resumeSession({ visitorId, pageUrl });
            const next = resumed ??
                (await client.startSession({
                    visitorId,
                    pageUrl,
                }));
            setSession(next);
            const initial = await client.listMessages(next);
            setMessages(initial);
            try {
                setChatStatus(await client.getStatus(next));
            }
            catch {
                setChatStatus(null);
            }
            return next;
        }
        finally {
            setLoading(false);
        }
    }, [client, resolveVisitorId, session]);
    useEffect(() => {
        void ensureSession().catch(() => { });
    }, [ensureSession]);
    const refreshStatus = useCallback(async () => {
        if (!session)
            return;
        try {
            setChatStatus(await client.getStatus(session));
        }
        catch {
            // ignore
        }
    }, [client, session]);
    const pollNewMessages = useCallback(async (since) => {
        if (!session)
            return;
        const fresh = await client.listMessages(session, { since });
        if (fresh.length === 0)
            return;
        setMessages((prev) => mergeMessages(prev, fresh));
    }, [client, session]);
    useEffect(() => {
        if (!session)
            return;
        const timer = window.setInterval(() => {
            void pollNewMessages(lastMessageAt).catch(() => { });
        }, pollIntervalMs);
        return () => window.clearInterval(timer);
    }, [lastMessageAt, pollIntervalMs, pollNewMessages, session]);
    useEffect(() => {
        if (!open || !session)
            return;
        void refreshStatus();
        const timer = window.setInterval(() => {
            void refreshStatus();
        }, statusPollIntervalMs);
        return () => window.clearInterval(timer);
    }, [open, refreshStatus, session, statusPollIntervalMs]);
    useEffect(() => {
        if (open && messages.length > 0) {
            setLastReadAt(messages.at(-1)?.created_at ?? null);
        }
    }, [messages, open]);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, operatorTyping]);
    const notifyTyping = useCallback((isTyping) => {
        if (!session)
            return;
        void client.setTyping(session, isTyping).catch(() => { });
    }, [client, session]);
    const handleOpen = async () => {
        setOpen(true);
        setError(null);
        if (!session) {
            await ensureSession();
        }
        setLastReadAt(messages.at(-1)?.created_at ?? new Date().toISOString());
    };
    const handleClose = () => {
        setOpen(false);
        void notifyTyping(false);
    };
    // const handlePreChat = async (event: FormEvent) => {
    //   event.preventDefault();
    //   const activeSession = await ensureSession();
    //   if (preChatName.trim() || preChatPhone.trim()) {
    //     await client.updateVisitor(activeSession, {
    //       first_name: preChatName.trim() || undefined,
    //       phone: preChatPhone.trim() || undefined,
    //     });
    //   }
    //   setPreChatDone(true);
    // };
    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed)
            return;
        setError(null);
        const activeSession = session ?? (await ensureSession());
        try {
            const sent = await client.sendMessage(activeSession, trimmed);
            setMessages((prev) => [...prev, sent]);
            setText("");
            void notifyTyping(false);
        }
        catch {
            setError(t.error);
        }
    };
    // const handleOfflineSubmit = async (event: FormEvent) => {
    //   event.preventDefault();
    //   const trimmed = offlineText.trim();
    //   if (!trimmed) return;
    //   setError(null);
    //   const activeSession = session ?? (await ensureSession());
    //   try {
    //     await client.updateVisitor(activeSession, {
    //       first_name: offlineName.trim() || undefined,
    //       phone: offlinePhone.trim() || undefined,
    //       email: offlineEmail.trim() || undefined,
    //     });
    //     const sent = await client.sendMessage(activeSession, trimmed);
    //     setMessages((prev) => [...prev, sent]);
    //     setOfflineSent(true);
    //     setOfflineText("");
    //   } catch {
    //     setError(t.error);
    //   }
    // };
    const handleTextChange = (value) => {
        setText(value);
        if (!session)
            return;
        void notifyTyping(value.trim().length > 0);
        if (typingStopRef.current != null) {
            window.clearTimeout(typingStopRef.current);
        }
        typingStopRef.current = window.setTimeout(() => {
            void notifyTyping(false);
        }, 3500);
    };
    const style = primaryColor
        ? { ["--q9-chat-primary"]: primaryColor }
        : undefined;
    const badgeLabel = unreadCount > 0 ? (unreadCount > 9 ? "9+" : String(unreadCount)) : null;
    return (_jsxs("div", { className: "q9-chat-widget", style: style, children: [_jsxs("button", { type: "button", className: "q9-chat-widget__launcher", "aria-label": badgeLabel ? t.unreadAria(unreadCount) : t.launcher, onClick: () => (open ? handleClose() : void handleOpen()), children: [_jsx("span", { className: "q9-chat-widget__launcher-icon", "aria-hidden": true, children: "\uD83D\uDCAC" }), badgeLabel ? (_jsx("span", { className: "q9-chat-widget__badge", children: badgeLabel })) : null] }), open ? (_jsxs("div", { className: "q9-chat-widget__panel", role: "dialog", "aria-label": title, children: [_jsxs("div", { className: "q9-chat-widget__header", children: [_jsx("span", { className: "q9-chat-widget__header-title", children: title }), _jsx("button", { type: "button", className: "q9-chat-widget__close", "aria-label": t.close, onClick: handleClose, children: "\u00D7" })] }), loading ? (_jsx("div", { className: "q9-chat-widget__status", children: t.loading })) : null, _jsxs("div", { className: "q9-chat-widget__messages", children: [welcomeMessage ? (_jsx("div", { className: "q9-chat-widget__welcome", children: welcomeMessage })) : null, messages.map((message) => (_jsx("div", { className: isMine(message, session)
                                    ? "q9-chat-widget__message q9-chat-widget__message--mine"
                                    : "q9-chat-widget__message q9-chat-widget__message--theirs", children: message.text }, message.id))), operatorTyping ? (_jsx("div", { className: "q9-chat-widget__typing", children: t.operatorTyping })) : null, _jsx("div", { ref: messagesEndRef })] }), error ? (_jsx("div", { className: "q9-chat-widget__status", children: error })) : null, _jsxs("div", { className: "q9-chat-widget__composer", children: [_jsx("textarea", { className: "q9-chat-widget__input", value: text, placeholder: t.placeholder, rows: 1, onChange: (e) => handleTextChange(e.target.value), onKeyDown: (e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        void handleSend();
                                    }
                                } }), _jsx("button", { type: "button", className: "q9-chat-widget__send", disabled: !text.trim() || loading, onClick: () => void handleSend(), children: t.send })] })] })) : null] }));
}
