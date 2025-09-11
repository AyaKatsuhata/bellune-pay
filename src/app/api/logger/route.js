import { logger } from '@/lib/logger';

export async function POST(req) {
  const body = await req.json();
  await logger(body);
  return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
}