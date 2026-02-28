import type { Route } from "./+types/webhook-xnotif";

export async function action({ request }: Route.ActionArgs) {
  const { notifications } = (await request.json()) as { notifications: any[] };

  const results = notifications.map((n: any) => {
    const handle = n.title?.replace(/^@/, "").toLowerCase();
    return {
      handle,
      body: n.body?.substring(0, 50),
      timestamp: n.timestamp,
      uri: n.data?.uri,
    };
  });

  console.log(
    `Received ${results.length} notifications:`,
    JSON.stringify(results),
  );
  return Response.json({ ok: true, received: results.length });
}
