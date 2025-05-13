import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageSquare,
  ShoppingCart,
  FileText,
  LogIn,
  LogOut,
  Settings,
  AlertTriangle,
  Check,
  Users,
  X,
  RefreshCw,
  UserPlus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatDate,
  getActivityIconConfig,
  getActivityBadgeConfig,
} from "@/lib/utils";
import useAuthStore, { useHydration } from "@/stores/useAuthStore";
import useActivityStore from "@/stores/useActivityStore";
import { FcInvite } from "react-icons/fc";

const renderIcon = (config) => {
  const { icon, color } = config;
  const iconClass = `h-5 w-5 ${color}`;

  switch (icon) {
    case "Users":
      return <Users className={iconClass} />;
    case "LogIn":
      return <LogIn className={iconClass} />;
    case "InviteSent":
      return <FcInvite className={iconClass} />;
    case "LogOut":
      return <LogOut className={iconClass} />;
    case "UserPlus":
      return <UserPlus className={iconClass} />;
    case "RefreshCw":
      return <RefreshCw className={iconClass} />;
    case "FileText":
      return <FileText className={iconClass} />;
    case "Mail":
      return <Mail className={iconClass} />;
    case "MessageSquare":
      return <MessageSquare className={iconClass} />;
    case "Settings":
      return <Settings className={iconClass} />;
    case "AlertTriangle":
      return <AlertTriangle className={iconClass} />;
    case "ShoppingCart":
      return <ShoppingCart className={iconClass} />;
    case "Check":
      return <Check className={iconClass} />;
    case "Trash2":
      return <Trash2 className={iconClass} />;
    default:
      return <Check className={iconClass} />;
  }
};

export default function ActivityPage() {
  const isHydrated = useHydration();
  const currentOrganization = useAuthStore(
    (state) => state.currentOrganization
  );
  const { fetchRecentActions, recentActions, isLoading } = useActivityStore();

  useEffect(() => {
    if (isHydrated && currentOrganization?._id) {
      fetchRecentActions();
    }
  }, [
    isHydrated,
    currentOrganization?._id,
    fetchRecentActions,
    currentOrganization,
  ]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Action Center</h1>
        <p className="text-muted-foreground">
          Track all activities and events across your CRM system.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Showing recent activities across your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] px-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-gray-500 text-lg">Loading Activities...</p>
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {recentActions.map((activity) => {
                  const iconConfig = getActivityIconConfig(activity.type);
                  const badgeConfig = getActivityBadgeConfig(activity.type);

                  return (
                    <div key={activity._id} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {renderIcon(iconConfig)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {activity.createdBy?.fullname || "User Name"}
                            </span>
                            <Badge className={badgeConfig.className}>
                              {badgeConfig.label}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        <p className="text-sm">{activity.description}</p>
                        {activity.metadata && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {activity.type === "customer_import" && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="flex items-center">
                                  <Check className="h-3 w-3 text-emerald-500 mr-1" />
                                  {activity.metadata.successCount} successful
                                </span>
                                {activity.metadata.errorCount > 0 && (
                                  <span className="flex items-center">
                                    <X className="h-3 w-3 text-red-500 mr-1" />
                                    {activity.metadata.errorCount} failed
                                  </span>
                                )}
                              </div>
                            )}
                            {activity.type === "customer_update" &&
                              activity.metadata.changedFields && (
                                <div className="mt-1">
                                  Changed:{" "}
                                  {activity.metadata.changedFields.join(", ")}
                                </div>
                              )}
                            {activity.type === "settings_change" && (
                              <div className="mt-1">
                                Changed: {activity.metadata.changes.join(", ")}
                              </div>
                            )}
                          </div>
                        )}
                        <Separator className="mt-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
