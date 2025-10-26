import { supabase } from "@/lib/supabase";

export interface Chat {
    id: string;
    user_id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    chat_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

export interface ChatWithMessages extends Chat {
    messages: Message[];
}

export const getChats = async (userId: string): Promise<Chat[]> => {
    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
};

export const getChatById = async (chatId: string, userId: string): Promise<ChatWithMessages | null> => {
    // Get chat
    const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .eq("user_id", userId)
        .single();

    if (chatError) throw new Error(chatError.message);
    if (!chatData) return null;

    // Get messages for this chat
    const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

    if (messagesError) throw new Error(messagesError.message);

    return {
        ...chatData,
        messages: messagesData || [],
    };
};

export const createChat = async (
    userId: string,
    title: string | null = null
): Promise<Chat> => {
    const { data, error } = await supabase
        .from("chats")
        .insert({
            user_id: userId,
            title,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Chat creation returned no data");

    return data;
};

export const updateChat = async (
    chatId: string,
    userId: string,
    updates: { title?: string }
): Promise<Chat> => {
    const { data, error } = await supabase
        .from("chats")
        .update(updates)
        .eq("id", chatId)
        .eq("user_id", userId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Chat not found");

    return data;
};

export const deleteChat = async (chatId: string, userId: string): Promise<void> => {
    const { error } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId)
        .eq("user_id", userId);

    if (error) throw new Error(error.message);
};

export const createMessage = async (
    chatId: string,
    message: { role: "user" | "assistant"; content: string }
): Promise<Message> => {
    const { data, error } = await supabase
        .from("messages")
        .insert({
            chat_id: chatId,
            role: message.role,
            content: message.content,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Message creation returned no data");

    return data;
};

export const getMessagesForChat = async (chatId: string): Promise<Message[]> => {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
};
