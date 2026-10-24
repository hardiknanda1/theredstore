import { siteConfig } from "@/config/site";
import { cleanText, isEmail } from "@/lib/validation";

const TOPICS: readonly string[] = siteConfig.contactTopics;

/**
 * Contact form endpoint. Validates input and returns a reference; wire this to an inbox,
 * ticketing tool or email service to deliver messages.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = cleanText(body?.name, 120);
  const message = cleanText(body?.message, 4000);
  const topic = TOPICS.includes(body?.topic) ? body.topic : "Other";
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please tell us your name.";
  if (!isEmail(body?.email)) errors.email = "Please enter a valid email address.";
  if (message.length < 10) errors.message = "Please write a little more (at least 10 characters).";
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 400 });

  const reference = `MSG-${Date.now().toString(36).toUpperCase()}`;
  return Response.json({ ok: true, reference, topic });
}
