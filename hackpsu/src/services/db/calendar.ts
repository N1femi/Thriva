import { supabase } from "@/lib/supabase";

export const insertEvent = async (
    event: { event: string;}[]
): Promise<void> => {
    const { data, error } = await supabase
        .from("events")
        .insert(event);

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Event insert returned no data");

    return data;
};