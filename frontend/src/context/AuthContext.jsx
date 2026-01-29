import { createContext, useContext, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { checkAuth, logout } from "../utils/authUtils";


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = () => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const verify = async () => {
      const result = await checkAuth("staff");
      setUser(result ?? null);
    };
    verify();
  }, []);

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logoutUser }}>
      <Outlet />
    </AuthContext.Provider>
  );
};

