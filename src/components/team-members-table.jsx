import React, { useMemo, useState, useCallback } from "react";
import { TableComponent } from "./segment-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
  UserX,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import useInviteStore from "@/stores/useInviteStore";

export function TeamMembersTable({ organizationData }) {
  const [loadingMemberId, setLoadingMemberId] = useState(null);
  const { updateMemberRole, cancelInvite, removeMember } = useInviteStore();

  const handleRoleChange = useCallback(
    async (member, newRole) => {
      if (member.role === newRole) return;

      setLoadingMemberId(member.id || member.inviteId);

      try {
        const isInvite = member.type === "invite";
        const result = await updateMemberRole(
          member.id || member.inviteId,
          newRole,
          isInvite,
          organizationData.organization.id
        );

        if (result.success) {
          console.log(`Role updated to ${newRole}`);
        } else {
          console.error("Failed to update role:", result.error);
        }
      } catch (error) {
        console.error("Error changing role:", error);
      } finally {
        setLoadingMemberId(null);
      }
    },
    [updateMemberRole, organizationData, setLoadingMemberId]
  );

  const handleRemoveMember = useCallback(
    async (member) => {
      setLoadingMemberId(member.id || member.inviteId);

      try {
        const isInvite = member.type === "invite";
        const result = isInvite
          ? await cancelInvite(member.inviteId)
          : await removeMember(member.id, organizationData.organization.id);

        if (result.success) {
          console.log(isInvite ? "Invitation cancelled" : "Member removed");
        } else {
          console.error(
            isInvite ? "Failed to cancel invite" : "Failed to remove member"
          );
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoadingMemberId(null);
      }
    },
    [cancelInvite, removeMember, organizationData, setLoadingMemberId]
  );

  const tableData = useMemo(() => {
    if (!organizationData) return [];

    const { members = [], pendingInvites = [] } = organizationData;

    const activeMembers = members.map((member) => ({
      ...member,
      type: "member",
    }));

    const invites = pendingInvites.map((invite) => ({
      ...invite,
      addedAt: invite.invitedAt,
      type: "invite",
    }));

    return [...activeMembers, ...invites];
  }, [organizationData]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const value = row.getValue("name");
          const isCurrentUser = row.original.isCurrentUser;

          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{value}</span>
              {isCurrentUser && (
                <Badge variant="outline" className="ml-2 text-xs bg-gray-100">
                  You
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.getValue("role");

          let badgeClass;
          switch (role) {
            case "admin":
              badgeClass = "bg-purple-100 text-purple-800";
              break;
            case "editor":
              badgeClass = "bg-blue-100 text-blue-700";
              break;
            default:
              badgeClass = "bg-gray-100 text-gray-800";
          }

          return (
            <Badge className={badgeClass}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status");

          let badgeClass;
          switch (status) {
            case "active":
              badgeClass = "bg-green-100 text-green-800";
              break;
            case "pending":
              badgeClass = "bg-amber-100 text-amber-800";
              break;
            case "rejected":
              badgeClass = "bg-red-100 text-red-800";
              break;
            default:
              badgeClass = "bg-gray-100 text-gray-800";
          }

          return (
            <Badge className={badgeClass}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "addedAt",
        header: "Joined Date",
        cell: ({ row }) => {
          const date = row.getValue("addedAt");
          const type = row.original.type;

          return (
            <div className="text-sm text-gray-600">
              {formatDate(date)}
              {type === "invite" && <span className="ml-1">(Invited)</span>}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const member = row.original;
          const isCurrentUser = member.isCurrentUser;
          const type = member.type;
          const isAdmin = organizationData?.currentUserRole === "admin";
          const isLoading = loadingMemberId === (member.id || member.inviteId);

          if (isCurrentUser || !isAdmin) {
            return null;
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Pencil className="mr-2 h-4 w-4" />
                    Change Role
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuLabel>Select new role</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => handleRoleChange(member, "admin")}
                      disabled={member.role === "admin"}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                      {member.role === "admin" && (
                        <CheckIcon className="ml-2 h-4 w-4" />
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleRoleChange(member, "editor")}
                      disabled={member.role === "editor"}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editor
                      {member.role === "editor" && (
                        <CheckIcon className="ml-2 h-4 w-4" />
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleRoleChange(member, "viewer")}
                      disabled={member.role === "viewer"}
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Viewer
                      {member.role === "viewer" && (
                        <CheckIcon className="ml-2 h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => handleRemoveMember(member)}
                >
                  {type === "invite" ? (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel Invitation
                    </>
                  ) : (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Remove Member
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [organizationData, loadingMemberId, handleRoleChange, handleRemoveMember]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Team Members ({tableData.length})
        </h2>
      </div>

      <TableComponent columns={columns} data={tableData} />
    </div>
  );
}
