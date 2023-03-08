import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./MainLayout";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
  },
]);
