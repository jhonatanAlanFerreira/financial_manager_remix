import { LoaderPropsInterface } from "~/components/loader/loader-props-interface";

export function Loader({ children, loading }: LoaderPropsInterface) {
  return (
    <>
      {loading && (
        <div className="flex items-center justify-center h-screen w-full z-10 absolute">
          <div className="loader ease-linear border-t-4 border-violet-950 border-solid rounded-full animate-spin h-16 w-16"></div>
        </div>
      )}
      <div className={loading ? "blur-sm pointer-events-none" : ""}>
        {children}
      </div>
    </>
  );
}
