import { createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { parse } from "cookie";
import { type GetServerSidePropsContext } from "next";

export function createClient({ req, res }: GetServerSidePropsContext) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const parsed = parse(req.headers.cookie || "");
          return Object.entries(parsed).map(([name, value]) => ({ name, value: value || "" }));
        },
        setAll(cookiesToSet) {
          res.setHeader(
            "Set-Cookie",
            cookiesToSet.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options),
            ),
          );
        },
      },
    },
  );

  return supabase;
}
