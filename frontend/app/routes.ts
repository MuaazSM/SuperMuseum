
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	// index("routes/home.tsx"),
	index("routes/map.tsx"),
	route("music", "routes/music.tsx"),
] satisfies RouteConfig;