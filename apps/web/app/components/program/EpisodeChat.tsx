"use client";

// =============================================================================
// Episode Chat — Phase 5 (Feature 3)
// =============================================================================
// Slide-out chat panel for asking AI about episode content.
// Uses transcript as context. Non-streaming server action.
// =============================================================================

import { useState, useRef, useEffect } from "react";
import { askEpisodeAction } from "@/app/actions/ai";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface EpisodeChatProps {
    episodeId: string;
    hasTranscript: boolean;
}

export function EpisodeChat({ episodeId, hasTranscript }: EpisodeChatProps) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!hasTranscript) return null;

    async function handleSend() {
        if (!input.trim() || loading) return;

        const question = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setLoading(true);

        const result = await askEpisodeAction(episodeId, question, messages);

        if (result.success && result.answer) {
            setMessages((prev) => [...prev, { role: "assistant", content: result.answer! }]);
        } else {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: result.error ?? "Failed to get a response." },
            ]);
        }
        setLoading(false);
    }

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(!open)}
                className="episode-chat-fab"
                aria-label={open ? "Close AI chat" : "Ask AI about this episode"}
                style={{
                    position: "fixed",
                    bottom: "2rem",
                    right: "2rem",
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "50%",
                    background: "var(--brand-orange)",
                    color: "#fff",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(227, 38, 82, 0.4)",
                    zIndex: 100,
                    transition: "transform 0.2s ease",
                    transform: open ? "rotate(45deg)" : "none",
                }}
            >
                {open ? "+" : "🤖"}
            </button>

            {/* Chat panel */}
            {open && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "6rem",
                        right: "2rem",
                        width: "min(24rem, calc(100vw - 2rem))",
                        maxHeight: "28rem",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-lg)",
                        boxShadow: "var(--shadow-elevated)",
                        display: "flex",
                        flexDirection: "column",
                        zIndex: 99,
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "0.75rem 1rem",
                            borderBottom: "1px solid var(--border-subtle)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                        }}
                    >
                        <span>🤖</span>
                        <span>Ask about this episode</span>
                        <span
                            style={{
                                fontSize: "0.6rem",
                                background: "var(--brand-orange-glow)",
                                color: "var(--brand-orange-light)",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "var(--radius-sm)",
                                marginLeft: "auto",
                            }}
                        >
                            AI
                        </span>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "0.75rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                        }}
                    >
                        {messages.length === 0 && (
                            <div style={{
                                color: "var(--text-muted)",
                                fontSize: "0.8rem",
                                textAlign: "center",
                                padding: "2rem 1rem",
                            }}>
                                Ask a question about this episode and I&apos;ll answer based on the transcript.
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                    maxWidth: "85%",
                                    padding: "0.6rem 0.9rem",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: "0.825rem",
                                    lineHeight: "1.5",
                                    background:
                                        msg.role === "user"
                                            ? "var(--brand-orange)"
                                            : "var(--bg-secondary)",
                                    color: msg.role === "user" ? "#fff" : "var(--text-secondary)",
                                }}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {loading && (
                            <div style={{
                                alignSelf: "flex-start",
                                padding: "0.6rem 0.9rem",
                                borderRadius: "var(--radius-md)",
                                background: "var(--bg-secondary)",
                                color: "var(--text-muted)",
                                fontSize: "0.825rem",
                            }}>
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        style={{
                            borderTop: "1px solid var(--border-subtle)",
                            padding: "0.5rem",
                            display: "flex",
                            gap: "0.5rem",
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about this episode..."
                            maxLength={1000}
                            style={{
                                flex: 1,
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                padding: "0.5rem 0.75rem",
                                fontSize: "0.825rem",
                                color: "var(--text-primary)",
                                outline: "none",
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            style={{
                                background: "var(--brand-orange)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "var(--radius-md)",
                                padding: "0.5rem 0.75rem",
                                fontSize: "0.825rem",
                                fontWeight: 600,
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading || !input.trim() ? 0.5 : 1,
                            }}
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
