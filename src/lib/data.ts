import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Goal, Tx } from "@/lib/finance";

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada");
  return data.user.id;
}

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const id = await uid();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (data) return data;
    const { data: created, error: e2 } = await supabase.from("profiles").insert({ id }).select("*").single();
    if (e2) throw e2;
    return created;
  },
});

export const transactionsQuery = queryOptions({
  queryKey: ["transactions"],
  queryFn: async () => {
    const since = new Date();
    since.setMonth(since.getMonth() - 6, 1);
    const { data, error } = await supabase
      .from("transactions")
      .select("id, amount, category, description, occurred_on")
      .gte("occurred_on", since.toISOString().slice(0, 10))
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Tx[];
  },
});

export const goalsQuery = queryOptions({
  queryKey: ["goals"],
  queryFn: async () => {
    const { data, error } = await supabase.from("goals").select("*").order("created_at");
    if (error) throw error;
    return (data ?? []) as Goal[];
  },
});

export const chatHistoryQuery = queryOptions({
  queryKey: ["chat-history"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("message")
      .order("created_at")
      .limit(200);
    if (error) throw error;
    return (data ?? []).map((r) => r.message);
  },
  staleTime: Infinity,
});
