"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChattingPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Send initial greeting when component loads
    useEffect(() => {
        const initialMessage: Message = {
            role: "assistant",
            content: `Hello! I'm your personal self-development coach. I'm here to help you reflect, grow, and achieve your goals.

Let me start by asking you a few questions:

1. What's one goal you'd like to work towards?
2. How are you feeling today?
3. What's been on your mind lately?

Feel free to answer any of these, or share whatever you'd like to talk about!`,
        };
        setMessages([initialMessage]);
    }, []);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = { role: "user", content: content.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);
        
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: newMessages.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();
            const assistantMessage: Message = {
                role: "assistant",
                content: data.content?.[0]?.text || "Sorry, I couldn't respond.",
            };

            setMessages([...newMessages, assistantMessage]);
        } catch (error) {
            console.error("Error:", error);
            setMessages([
                ...newMessages,
                {
                    role: "assistant",
                    content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input).then();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-teal-50 to-cyan-50">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Chat Messages */}
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex gap-4 ${
                            message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                        {message.role === "assistant" && (
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        )}

                        <div
                            className={`max-w-2xl px-6 py-4 rounded-2xl ${
                                message.role === "user"
                                    ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                                    : "bg-white shadow-md text-slate-800"
                            }`}
                        >
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {message.content}
                            </p>
                        </div>

                        {message.role === "user" && (
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-600" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                    <div className="flex gap-4 justify-start">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="bg-white shadow-md px-6 py-4 rounded-2xl">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-6">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Share your thoughts..."
                            disabled={isLoading}
                            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 text-slate-900 placeholder:text-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}