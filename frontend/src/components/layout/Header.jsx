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
    { name: "Admin Dashboard", icon: Shield, color: "text-[#87b6c6]" },
    { name: "Employee Portal", icon: User, color: "text-[#87b6c6]" },
    { name: "HR Portal", icon: Building2, color: "text-[#87b6c6]" },
    { name: "IT Portal", icon: HardDrive, color: "text-[#87b6c6]" },
  ];

  const handlePortalSwitch = (portalName) => {
    const success = switchPortal(portalName);
    if (success) {
      console.log(`Switched to ${portalName}`);
      window.location.href = '/dashboard';
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
    <header className="bg-gray-900 bg-[url('/top.jpg')] bg-cover bg-center border-b border-gray-700 px-6 py-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 rounded-full flex items-center justify-center">
            <img
              src="/WorkWayveLogo.png"
            />
          </div>
          <img src="/WorkName.png" alt="WorkWayve" className="h-8 w-auto" />
        </div>

        <div className="flex items-center space-x-4">
          {/* Portal Selection Dropdown - Show for HR/IT/Admin users */}
          {canShowPortalToggle() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 px-4 py-2 h-10 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-[#0c100f] border-b border-[#0c100f] text-white"
                >
                  <currentPortalData.icon
                    className={`h-4 w-4 ${currentPortalData.color}`}
                  />
                  <span className="hidden sm:inline text-sm font-medium text-blue-100">
                    {currentPortal}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-lg shadow-lg border border-gray-700"
                style={{ backgroundColor: "#0c100f", borderColor: "#0c100f" }}
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
                          ? "text-white bg-[#1d3243]"
                          : "hover:text-white hover:bg-[#284a59]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${portal.color}`} />
                      <span className="text-blue-100">{portalName}</span>
                      {portalName === "Admin Dashboard" && (
                        <span className="text-xs bg-[#1d3243] text-blue-100 px-1 py-0.5 rounded ml-auto">
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
          <div className="text-right hidden md:block text-blue-100">
            <p className="text-sm font-medium text-blue-100">{user?.name}</p>
            <p className="text-xs text-muted-foreground text-blue-100">{user?.employeeId}</p>
          </div>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium bg-[#1d3243] text-blue-100`}
          >
            {user?.role?.toUpperCase()}
          </span>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="relative h-10 w-10 rounded-full bg-[#0c100f]"
              >
                <Avatar className="h-10 w-10 text-gray-900">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 text-blue-100"
              align="end"
              forceMount
              style={{ backgroundColor: "#0c100f", borderColor: "#0c100f" }}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-blue-100">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground text-blue-100">
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
