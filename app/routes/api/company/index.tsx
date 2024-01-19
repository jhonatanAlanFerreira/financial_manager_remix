import { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth.server";
import { list } from "~/data/company.server";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  return list(user);
};
