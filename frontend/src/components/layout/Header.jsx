import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileSettingsDialog } from "@/components/dialogs/ProfileSettingsDialog";
import { SupportDialog } from "@/components/dialogs/SupportDialog";
import { ChevronDown, Building2, HardDrive, User, Shield } from "lucide-react";

export function Header() {
  const {
    user,
    logout,
    currentPortal,
    switchPortal,
    canShowPortalToggle,
    getAvailablePortals,
    logAdminAction,
  } = useAuth();

  const portals = [
    { name: "Admin Dashboard", icon: Shield, color: "text-red-600" },
    { name: "Employee Portal", icon: User, color: "text-purple-600" },
    { name: "HR Portal", icon: Building2, color: "text-blue-600" },
    { name: "IT Portal", icon: HardDrive, color: "text-green-600" },
  ];

  const handlePortalSwitch = (portalName) => {
    const success = switchPortal(portalName);
    if (success) {
      console.log(`Switched to ${portalName}`);
      // logAdminAction("Portal Switch", { targetPortal: portalName });
    } else {
      console.log(`Access denied to ${portalName}`);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500 text-white";
      case "hr":
        return "bg-blue-500 text-white";
      case "it":
        return "bg-green-500 text-white";
      default:
        return "bg-purple-500 text-white";
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const currentPortalData = portals.find((p) => p.name === currentPortal);
  const availablePortals = getAvailablePortals();

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <img
              src="/images/mentura-logo.png"
              alt="Mentura Logo"
              className="h-10 w-auto"
            />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Mentura</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Portal Selection Dropdown - Show for HR/IT/Admin users */}
          {canShowPortalToggle() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 px-4 py-2 h-10 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <currentPortalData.icon
                    className={`h-4 w-4 ${currentPortalData.color}`}
                  />
                  <span className="hidden sm:inline text-sm font-medium">
                    {currentPortal}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-lg shadow-lg border border-border bg-card"
              >
                <DropdownMenuLabel className="text-sm font-medium text-muted-foreground">
                  Switch Portal
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availablePortals.map((portalName) => {
                  const portal = portals.find((p) => p.name === portalName);
                  const Icon = portal.icon;
                  return (
                    <DropdownMenuItem
                      key={portalName}
                      onClick={() => handlePortalSwitch(portalName)}
                      className={`flex items-center space-x-2 cursor-pointer rounded-md transition-colors ${
                        currentPortal === portalName
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${portal.color}`} />
                      <span className="text-sm">{portalName}</span>
                      {portalName === "Admin Dashboard" && (
                        <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded ml-auto">
                          ADMIN
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Info */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.employeeId}</p>
          </div>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
              user?.role || ""
            )}`}
          >
            {user?.role?.toUpperCase()}
          </span>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ProfileSettingsDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Profile Settings
                </DropdownMenuItem>
              </ProfileSettingsDialog>
              <SupportDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Support
                </DropdownMenuItem>
              </SupportDialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
