import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components';


export default function StaffRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (user === undefined) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location }}
      />
    );
  }
  return <Outlet />;
}
