import { useNavigation } from "@remix-run/react";
import { ReactNode } from "react";
import { Loader } from "~/components/loader/loader";

export function NavigationLoader({
  children,
}: {
  children: ReactNode;
}) {
  const navigation = useNavigation();

  return <Loader loading={navigation.state === "loading"}>{children}</Loader>;
}
