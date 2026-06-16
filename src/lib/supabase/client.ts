import { createClient } from "@supabase/supabase-js";
import { appConfig } from "../config";

export function createSupabaseBrowserClient() {
  if (!appConfig.supabase.url || !appConfig.supabase.anonKey) {
    throw new Error("Supabase is enabled but NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  }

  return createClient(appConfig.supabase.url, appConfig.supabase.anonKey);
}
