import { requireUserSession } from "~/data/auth.server";

export default function Index() {
  return <span>Index</span>;
}

export async function loader({ request }: { request: Request }) {
  await requireUserSession(request);
  return null;
}
