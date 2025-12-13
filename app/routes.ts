import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sources", "routes/sources.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
