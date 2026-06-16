export const appConfig = {
  appName: "Wealth Folio",
  dataBackend: "local" as "local" | "supabase",
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
};
