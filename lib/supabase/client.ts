import { createClient } from "@supabase/supabase-js";

const configuredSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
// Supabase 대시보드의 REST endpoint를 그대로 붙여 넣은 경우에도
// createClient가 /rest/v1을 중복으로 추가하지 않도록 프로젝트 URL로 정규화한다.
const supabaseUrl = configuredSupabaseUrl.replace(/\/rest\/v1\/?$/, "");
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
