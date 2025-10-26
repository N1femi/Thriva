import { supabase } from "@/lib/supabase";

export interface JournalEntry {
    id: string;
    user_id: string;
    title: string;
    text: string;
    created_at?: string;
    updated_at?: string;
}

export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
    const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
};

export const insertJournalEntry = async (
    entry: { user_id: string; title: string; text: string }
): Promise<JournalEntry> => {
    const { data, error } = await supabase
        .from("entries")
        .insert(entry)
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Journal entry insert returned no data");

    return data;
};

export const updateJournalEntry = async (
    id: string,
    userId: string,
    updates: { title?: string; text?: string }
): Promise<JournalEntry> => {
    const { data, error } = await supabase
        .from("entries")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Journal entry not found");

    return data;
};

export const deleteJournalEntry = async (
    id: string,
    userId: string
): Promise<void> => {
    const { error } = await supabase
        .from("entries")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    if (error) throw new Error(error.message);
};
