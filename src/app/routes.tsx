import { createBrowserRouter } from "react-router";
import { EmrScreen } from "./components/emr/EmrScreen";
import { LabViewer } from "./components/emr/LabViewer";

export const router = createBrowserRouter([
  { path: "/",           Component: EmrScreen },
  { path: "/lab-viewer", Component: LabViewer },
  { path: "*",           Component: EmrScreen },
]);
