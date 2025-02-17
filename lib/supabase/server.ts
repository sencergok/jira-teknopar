import { createServerClient } from '@supabase/ssr';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function createClient(
  req?: NextApiRequest,
  res?: NextApiResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (req) {
            return req.cookies[name];
          }
          return undefined;
        },
        set(name: string, value: string) {
          if (res) {
            res.setHeader('Set-Cookie', `${name}=${value}; Path=/`);
          }
        },
        remove(name: string) {
          if (res) {
            res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`);
          }
        },
      },
    }
  );
} 