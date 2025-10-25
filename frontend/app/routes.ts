
// export default [
//   index("routes/home.tsx"),
//   { path: "map", file: "routes/map.tsx" }
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("music", "routes/music.tsx"),
    route("map", "routes/map.tsx"),
] satisfies RouteConfig;
