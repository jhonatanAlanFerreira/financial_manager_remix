import { requireUserSession } from "~/data/auth.server";

export default function Expenses() {
  return <span>Expenses</span>;
}

export async function loader({ request }: { request: Request }) {
  await requireUserSession(request);
  return null;
}