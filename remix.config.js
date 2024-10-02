import { createRoutesFromFolders } from "@remix-run/v1-route-convention";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/*"],
  browserNodeBuiltinsPolyfill: {
    modules: {
      process: true,
    },
  },
  routes: (defineRoutes) => {
    return createRoutesFromFolders(defineRoutes, {
      ignoredFilePatterns: ["**/.*", "**/*.css"],
    });
  },
};
