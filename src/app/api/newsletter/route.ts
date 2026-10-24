import { isEmail } from "@/lib/validation";

/**
 * Newsletter sign-up. Validates the address and acknowledges it; connect an email
 * provider here (e.g. a list API call) to store subscribers.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isEmail(body?.email)) {
    return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  return Response.json({ ok: true });
}
