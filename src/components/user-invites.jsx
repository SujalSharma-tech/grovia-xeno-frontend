import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import useInviteStore from "@/stores/useInviteStore";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Building, Check, RefreshCw, UserPlus, X } from "lucide-react";

export default function UserInvites() {
  const [open, setOpen] = useState(false);
  const {
    invites,
    fetchUserInvites,
    acceptInvite,
    rejectInvite,
    isInviteLoading,
  } = useInviteStore();

  useEffect(() => {
    fetchUserInvites();
  }, [fetchUserInvites]);

  const handleRefresh = () => {
    fetchUserInvites();
  };

  const handleAccept = async (inviteId) => {
    const result = await acceptInvite(inviteId);

    if (result.success) {
      console.log("Invite accepted");
    } else {
      console.log("Failed to accept invite", result.error);
    }
  };

  const handleReject = async (inviteId) => {
    const result = await rejectInvite(inviteId);

    if (result.success) {
      console.log("Invite rejected");
    } else {
      console.log("Failed to reject invite", result.error);
    }
  };

  const pendingInvites = invites.filter(
    (invite) => invite.status === "pending"
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <UserPlus className="h-5 w-5" />
          {pendingInvites.length > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {pendingInvites.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Organization Invites</h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isInviteLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isInviteLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {isInviteLoading ? (
          <div className="flex justify-center items-center p-8">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span>Loading invites...</span>
          </div>
        ) : pendingInvites.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            You have no pending invitations
          </div>
        ) : (
          <div className="max-h-[300px] overflow-auto">
            {pendingInvites.map((invite) => (
              <div
                key={invite._id}
                className="p-4 border-b last:border-b-0 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">
                      {invite.organizationId.name}
                    </span>
                  </div>
                  <Badge>
                    {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                  </Badge>
                </div>

                <p className="text-sm text-gray-500">
                  Invited by{" "}
                  {invite.inviterId.fullname || invite.inviterId.email}
                </p>

                <p className="text-sm text-gray-500">
                  {formatDate(invite.createdAt)}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAccept(invite._id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleReject(invite._id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
