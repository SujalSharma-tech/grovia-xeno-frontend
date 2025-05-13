import {
  ActivitySquareIcon,
  BarChart3Icon,
  Blocks,
  Calendar,
  ChevronUp,
  Home,
  Inbox,
  Layers,
  LogOut,
  MessageSquareHeartIcon,
  Search,
  Settings,
  User2,
  UserPlus,
  UserRoundPlus,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router-dom";
import useAuthStore from "@/stores/useAuthStore";
import OrganizationSelector from "./OrganizationSelector";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Blocks,
  },
  {
    title: "Segments",
    url: "segments",
    icon: Users,
  },
  {
    title: "Campaigns",
    url: "campaigns",
    icon: MessageSquareHeartIcon,
  },
  {
    title: "Customers",
    url: "addcustomer",
    icon: UserPlus,
  },
  {
    title: "Action Center",
    url: "actioncenter",
    icon: ActivitySquareIcon,
  },
  {
    title: "Team Members",
    url: "/team",
    icon: UserRoundPlus,
  },
];

export function AppSidebar() {
  const { user, logout } = useAuthStore();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };
  return (
    <Sidebar collapsible="icon" variant="floating">
      <CollapsibleHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <OrganizationSelector />
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="font-medium text-lg" asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user?.name || "User Name"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-48 bg-gray-200 p-1 rounded-md"
              >
                <DropdownMenuItem className="outline-none hover:bg-gray-300">
                  <button
                    className=" text-left w-full flex items-center p-1 "
                    onClick={() => {
                      console.log("Profile clicked");
                    }}
                  >
                    <User2 className="mr-2" size={20} />
                    Profile
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="h-[1px] bg-gray-300" />
                <DropdownMenuItem className="outline-none hover:bg-gray-300">
                  <button
                    className=" text-left w-full flex items-center p-1"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2" size={20} />
                    Sign Out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function CollapsibleHeader() {
  const { open: collapsed } = useSidebar();
  if (!collapsed) {
    return (
      <SidebarHeader className="border-b border-border p-2 flex justify-center items-center">
        <Layers className="h-6 w-6 text-primary" />
      </SidebarHeader>
    );
  }

  return (
    <SidebarHeader className="border-b border-border p-5">
      <div className="flex items-center gap-2 font-semibold">
        <Layers className="h-6 w-6 text-primary" />
        <span className="text-xl gradient-text">Grovia CRM</span>
      </div>
    </SidebarHeader>
  );
}
