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

  useEffect(() => {
    const storedUser = localStorage.getItem("portalUser");
    const storedPortal = localStorage.getItem("currentPortal");
    if (storedUser) {
      const user = JSON.parse(storedUser);
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
      // Map backend response to expected shape
      const transformedUser = {
        ...user,
        name: user.username,
        email: user.username,
        role: user.department?.toLowerCase(),
        employeeId: user.employee_id
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

  // -------- Add this function! --------
  const logAdminAction = (action, details) => {
    // For now, just log to the console. You can replace with real backend API call.
    console.log("[ADMIN ACTION]", action, details);
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
        logAdminAction, // <-- add this
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