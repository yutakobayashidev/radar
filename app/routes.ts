import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sources", "routes/sources.tsx"),
  route("api/radar-items", "routes/api/radar-items.ts"),
] satisfies RouteConfig;
