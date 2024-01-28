import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedin } from "./user-info";

const ProtectedRoute = ({ children }) => {
  const [authentication, setAuthentication] = useState(true);
  const [renderThis, setRenderThis] = useState(children);
  useEffect(() => {
    (async () => {
      const auth = await isLoggedin();
      setAuthentication(auth);
    })();
  }, []);

  useEffect(() => {
    if (!authentication) {
      setRenderThis(<Navigate to="/login" replace />);
    }
  }, [authentication]);

  return renderThis;
};
export default ProtectedRoute;
