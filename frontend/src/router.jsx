import { Navigate, useRoutes } from "react-router-dom";
import ProtectedRoute from "./utils/protected-routes";
import Home from "./pages/Home";
import SignIn from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

export default function Router() {
  const routes = useRoutes([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      ),
    },
    {
      path: "/login",
      element: <SignIn />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/404",
      element: <NotFound />,
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
