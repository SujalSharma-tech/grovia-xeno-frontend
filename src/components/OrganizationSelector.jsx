import { useEffect } from "react";
import useAuthStore from "@/stores/useAuthStore";
import useDashboardStore from "@/stores/useDashboardStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building, ChevronDown, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "./ui/sidebar";
import { cn } from "@/lib/utils";

const OrganizationSelector = () => {
  const { open: sidebarExpanded } = useSidebar();
  const {
    organizations,
    currentOrganization,
    switchOrganization,
    fetchOrganizations,
  } = useAuthStore();

  const { fetchDashboardStats } = useDashboardStore();
  const location = useLocation();

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleSwitchOrganization = async (organizationId) => {
    const result = switchOrganization(organizationId);

    if (result.success) {
      if (location.pathname === "/dashboard" || location.pathname === "/") {
        await fetchDashboardStats();
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 px-2 py-1.5  hover:text-foreground",
            sidebarExpanded ? "justify-between" : "justify-center"
          )}
        >
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {sidebarExpanded && (
              <span className="truncate max-w-[130px]">
                {currentOrganization?.name || "Select Organization"}
              </span>
            )}
          </div>
          {sidebarExpanded && <ChevronDown className="h-4 w-4 opacity-50" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>Your Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <DropdownMenuItem
              key={org._id}
              className={
                currentOrganization?._id === org._id ? "bg-primary/10" : ""
              }
              onClick={() => handleSwitchOrganization(org._id)}
            >
              <Building className="h-4 w-4 mr-2" />
              <span className="truncate">{org.name}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No organizations found</DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/create-organization" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Organization</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganizationSelector;
