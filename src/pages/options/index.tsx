import "@pages/options/index.css";
import OptionsPage from "@src/pages/options/pages";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import SourceDetails from "./pages/source-details";

refreshOnUpdate("pages/options");

const router = createHashRouter([
  {
    path: "/",
    element: <OptionsPage />,
  },
  {
    path: "/source-details/:id",
    element: <SourceDetails />,
  },
]);

function init() {
  const appContainer = document.querySelector("#app-container");

  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }

  const root = createRoot(appContainer);

  root.render(<RouterProvider router={router} />);
}

init();
