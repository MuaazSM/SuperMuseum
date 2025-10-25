import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  { path: "map", file: "routes/map.tsx" }
] satisfies RouteConfig;
