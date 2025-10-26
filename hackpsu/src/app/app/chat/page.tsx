"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Chat {
    id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
}

export default function ChattingPage() {
    const { session } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chats on mount
    useEffect(() => {
        if (session) {
            loadChats();
        }
    }, [session]);

    const loadChats = async () => {
        if (!session) return;

        try {
            const response = await fetch("/api/chat", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setChats(data.data || []);
            }
        } catch (error) {
            console.error("Error loading chats:", error);
        }
    };

    const loadChat = async (chatId: string) => {
        if (!session) return;

        setIsLoadingChat(true);
        try {
            const response = await fetch("/api/chat", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ chatId }),
            });

            const data = await response.json();
            if (data.success && data.data) {
                setCurrentChatId(chatId);
                setMessages(data.data.messages || []);
            }
        } catch (error) {
            console.error("Error loading chat:", error);
        } finally {
            setIsLoadingChat(false);
        }
    };

    const createNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
        setInput("");
    };

    const deleteChat = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session) return;

        setIsDeleting(chatId);
        try {
            const response = await fetch(`/api/chat?id=${chatId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                // If we were viewing this chat, clear the view
                if (currentChatId === chatId) {
                    setCurrentChatId(null);
                    setMessages([]);
                }
                // Reload chats
                await loadChats();
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    const sendMessage = async (content: string) => {
        if (!content.trim() || !session) return;

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
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    messages: newMessages,
                    chatId: currentChatId,
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `Server returned ${response.status}`);
            }
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Update currentChatId if we got a new one
            if (data.chatId && !currentChatId) {
                setCurrentChatId(data.chatId);
                await loadChats();
            }
            
            const assistantMessage: Message = {
                role: "assistant",
                content: data.content?.[0]?.text || "Sorry, I couldn't respond.",
            };

            setMessages([...newMessages, assistantMessage]);
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setMessages([
                ...newMessages,
                {
                    role: "assistant",
                    content: `I'm sorry, I'm having trouble connecting right now: ${errorMessage}`,
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
        <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-teal-50 to-cyan-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <button
                        onClick={createNewChat}
                        className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {chats.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500 text-center">
                            No chats yet. Start a new conversation!
                        </div>
                    ) : (
                        <div className="p-2">
                            {chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => loadChat(chat.id)}
                                    className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                                        currentChatId === chat.id
                                            ? "bg-teal-50 border border-teal-200"
                                            : "hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="font-medium text-sm text-slate-800 truncate pr-8">
                                        {chat.title || "New Chat"}
                                    </div>
                                    <button
                                        onClick={(e) => deleteChat(chat.id, e)}
                                        disabled={isDeleting === chat.id}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 text-red-500 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoadingChat ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-slate-500">Loading chat...</div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-slate-500">
                                <Bot className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                                <p>I'm here to help you reflect, grow, and achieve your goals.</p>
                            </div>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}

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
        </div>
    );
}