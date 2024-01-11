import { useNavigation } from "@remix-run/react";
import { ReactNode } from "react";

export default function NavigationLoader({
  children,
}: {
  children: ReactNode;
}) {
  const navigation = useNavigation();

  return (
    <>
      {navigation.state === "loading" && (
        <div className="flex items-center justify-center h-screen w-screen z-10 absolute">
          <div className="loader ease-linear border-t-4 border-violet-950 border-solid rounded-full animate-spin h-16 w-16"></div>
        </div>
      )}
      <div
        className={
          navigation.state === "loading" ? "blur-sm pointer-events-none" : ""
        }
      >
        {children}
      </div>
    </>
  );
}
