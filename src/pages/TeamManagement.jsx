import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useInviteStore from "@/stores/useInviteStore";
import useAuthStore, { useHydration } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Building,
  Loader2,
  Mail,
  Trash2,
  UserPlus,
} from "lucide-react";
import { TeamMembersTable } from "@/components/team-members-table";

export default function TeamManagement() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingOrg, setIsDeletingOrg] = useState(false);

  const navigate = useNavigate();

  const {
    sendInvite,
    isLoading,
    fetchMembers,
    organizationData,
    isInviteLoading,
  } = useInviteStore();
  const {
    currentOrganization,
    organizations,
    fetchOrganizations,
    deleteOrganization,
  } = useAuthStore();

  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated && currentOrganization?._id) {
      fetchMembers();
      fetchOrganizations();
    } else if (isHydrated && !currentOrganization) {
      console.log("No organization available after hydration");
    }
  }, [
    isHydrated,
    currentOrganization?._id,
    fetchMembers,
    fetchOrganizations,
    currentOrganization,
  ]);

  const handleSendInvite = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    const result = await sendInvite(email, role);

    if (result.success) {
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
    } else {
      toast.error(result.error || "Failed to send invite");
    }
  };

  const handleDeleteOrganization = async () => {
    if (!currentOrganization?._id) return;

    setIsDeletingOrg(true);

    try {
      const result = await deleteOrganization(currentOrganization._id);

      if (result.success) {
        toast.success(
          `${currentOrganization.name} has been permanently deleted.`
        );

        if (!result.hasOrganizations) {
          navigate("/organization/setup");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(result.error || "Failed to delete organization");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsDeletingOrg(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-gray-500">
          Invite team members to collaborate on{" "}
          {currentOrganization?.name || "your organization"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Invite Team Members
          </CardTitle>
          <CardDescription>
            Send invitations to your colleagues to join the organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    Admin - Full access to all features
                  </SelectItem>
                  <SelectItem value="editor">
                    Editor - Can edit but not manage users
                  </SelectItem>
                  <SelectItem value="viewer">
                    Viewer - View-only access
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isInviteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending invite...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && !organizationData ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading team members...</span>
        </div>
      ) : (
        <TeamMembersTable organizationData={organizationData} />
      )}

      <Card className="border-red-200 mt-8">
        <CardHeader className="text-red-700">
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/80">
            Actions here can't be undone. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md border-red-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Delete this organization</h3>
                <p className="text-sm text-gray-500">
                  This will permanently delete {currentOrganization?.name}, all
                  its data, and remove all team members.
                </p>
              </div>
              <Button
                variant="destructive"
                className="!text-red-600 !bg-red-200 !hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Organization
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ transform: "translate(-50%,-50%)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Delete Organization
            </DialogTitle>
            <DialogDescription>
              This action is irreversible. All data, members, and settings for{" "}
              <span className="font-semibold">{currentOrganization?.name}</span>{" "}
              will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="!bg-amber-50 border !border-amber-200 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 !text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm !text-amber-800">
                  {organizations?.length === 1
                    ? "This is your only organization. After deletion, you'll be redirected to create a new organization."
                    : "After deletion, you'll be switched to another organization."}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="!text-gray-700 !bg-gray-100 !hover:bg-gray-50"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingOrg}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="!text-red-600 !bg-red-200 !hover:bg-red-50"
              onClick={handleDeleteOrganization}
              disabled={isDeletingOrg}
            >
              {isDeletingOrg ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Organization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
