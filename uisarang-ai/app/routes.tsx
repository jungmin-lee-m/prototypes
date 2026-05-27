import { createBrowserRouter } from "react-router";
import { UisarangScreen } from "./components/uisarang/UisarangScreen";

export const router = createBrowserRouter(
  [
    { path: "/", Component: UisarangScreen },
    { path: "*", Component: UisarangScreen },
  ],
  { basename: import.meta.env.BASE_URL + "uisarang-ai" },
);
