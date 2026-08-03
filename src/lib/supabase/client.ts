import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicKey, supabaseUrl } from "./env";

// createBrowserClient는 내부적으로 싱글턴이라 매번 호출해도 인스턴스는 하나다.
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabasePublicKey());
}
