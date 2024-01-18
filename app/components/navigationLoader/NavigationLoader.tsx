import { useNavigation } from "@remix-run/react";
import { ReactNode } from "react";
import Loader from "../loader/Loader";

export default function NavigationLoader({
  children,
}: {
  children: ReactNode;
}) {
  const navigation = useNavigation();

  return <Loader loading={navigation.state === "loading"}>{children}</Loader>;
}
