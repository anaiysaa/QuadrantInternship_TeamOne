import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    currentPortal: "Employee Portal"
  });

  const logAdminAction = (action, details) => {
    // For now, just log to console (replace with API call if needed)
    console.log("ADMIN ACTION:", action, details);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("portalUser");
    const storedPortal = localStorage.getItem("currentPortal");
    if (storedUser) {
      // Guarantee both .id and .employeeId are always set on user
      const userFromStorage = JSON.parse(storedUser);
      const user = {
        ...userFromStorage,
        id: userFromStorage.employeeId || userFromStorage.id || userFromStorage.employee_id,
        employeeId: userFromStorage.employeeId || userFromStorage.id || userFromStorage.employee_id,
      };
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        currentPortal: storedPortal || "Employee Portal"
      });
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username, password) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await axios.post("/login", { username, password });
      const user = res.data;
      // Always set id and employeeId
      const transformedUser = {
        ...user,
        name: user.name, // <-- This is the real name from backend
        email: user.username, // Username is still email for login purposes
        role: user.department?.toLowerCase(),
        id: user.employee_id,            // always set id
        employeeId: user.employee_id     // always set employeeId
      };

      localStorage.setItem("portalUser", JSON.stringify(transformedUser));

      let portals = ["Employee Portal"];
      if (user.department === "Admin") {
        portals = ["Admin Dashboard", "HR Portal", "IT Portal", "Employee Portal"];
      } else if (user.department === "HR") {
        portals.push("HR Portal");
      } else if (user.department === "IT") {
        portals.push("IT Portal");
      }
      const defaultPortal = portals[0];
      localStorage.setItem("currentPortal", defaultPortal);

      setAuthState({
        user: transformedUser,
        isAuthenticated: true,
        isLoading: false,
        currentPortal: defaultPortal,
        portals
      });

      return { success: true };
    } catch (err) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: false, error: err?.response?.data?.error || "Login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("portalUser");
    localStorage.removeItem("currentPortal");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      currentPortal: "Employee Portal"
    });
  };

  const switchPortal = (portalName) => {
    if (!canAccessPortal(portalName)) return false;
    localStorage.setItem("currentPortal", portalName);
    setAuthState((prev) => ({
      ...prev,
      currentPortal: portalName
    }));
    return true;
  };

  const canAccessPortal = (portalName) => {
    if (!authState.user) return false;
    if (authState.user.department === "Admin") return true;
    if (portalName === "Employee Portal") return true;
    if (portalName === "HR Portal" && authState.user.department === "HR") return true;
    if (portalName === "IT Portal" && authState.user.department === "IT") return true;
    if (portalName === "Admin Dashboard" && authState.user.department === "Admin") return true;
    return false;
  };

  const getAvailablePortals = () => {
    if (!authState.user) return ["Employee Portal"];
    if (authState.user.department === "Admin")
      return ["Admin Dashboard", "Employee Portal", "HR Portal", "IT Portal"];
    const portals = ["Employee Portal"];
    if (authState.user.department === "HR") portals.push("HR Portal");
    if (authState.user.department === "IT") portals.push("IT Portal");
    return portals;
  };

  const canShowPortalToggle = () => {
    if (!authState.user) return false;
    const dept = authState.user.department;
    return (
      dept === "Admin" ||
      dept === "HR" ||
      dept === "IT"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        switchPortal,
        canAccessPortal,
        getAvailablePortals,
        canShowPortalToggle,
        logAdminAction // <-- Make sure this is included!
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
