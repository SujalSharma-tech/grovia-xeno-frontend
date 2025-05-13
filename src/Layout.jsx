import {
  Bell,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import "./App.css";

import { Button } from "./components/ui/button";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

import { AppSidebar } from "./components/app-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import UserInvites from "./components/user-invites";
import useAuthStore from "./stores/useAuthStore";

export function Layout({ children }) {
  const { logout } = useAuthStore();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
          <UserInvites />

          <div className="ml-auto flex items-center gap-4">
            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 p-0">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-48 bg-gray-200 p-1 rounded-md"
              >
                <DropdownMenuLabel>Profile</DropdownMenuLabel>
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
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
