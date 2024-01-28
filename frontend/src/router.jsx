import { Navigate, useRoutes } from "react-router-dom";
import ProtectedRoute from "./utils/protected-routes";
import Home from "./pages/Home";
import SignIn from "./pages/Login";
import Register from "./pages/Register";

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
      element: <h1>are you lost?</h1>,
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
