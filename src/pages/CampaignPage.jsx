import { TableComponent } from "@/components/segment-table";
import { Button } from "@/components/ui/button";
import useAuthStore, { useHydration } from "@/stores/useAuthStore";
import useCampaignStore from "@/stores/useCampaignStore";
import {
  Edit,
  Trash,
  Users,
  Plus,
  LucideTicketCheck,
  FileBarChart,
  Loader2,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const CampaignPage = () => {
  const isHydrated = useHydration();
  const currentOrganization = useAuthStore(
    (state) => state.currentOrganization
  );
  const pollingRef = useRef(null);

  const { fetchCampaigns, campaigns, deleteCampaign, isLoading } =
    useCampaignStore();

  useEffect(() => {
    if (isHydrated && currentOrganization?._id) {
      fetchCampaigns();
    }
  }, [isHydrated, currentOrganization?._id, fetchCampaigns]);

  useEffect(() => {
    const hasPendingCampaigns = campaigns.some(
      (campaign) => campaign.status === "PENDING"
    );

    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }

    if (hasPendingCampaigns) {
      pollingRef.current = setTimeout(() => {
        fetchCampaigns();
      }, 10000);
    }

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [campaigns, fetchCampaigns]);

  const handleCampaignDelete = async (id) => {
    try {
      const response = await deleteCampaign(id);
      if (response.success) {
        toast.success("Campaign deleted successfully");
      } else {
        toast.error(response.error || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Campaign Name",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const getStatusStyles = () => {
          switch (status) {
            case "PENDING":
              return "bg-yellow-100 text-yellow-800";
            case "COMPLETED":
              return "bg-green-100 text-green-800";
            case "FAILED":
              return "bg-red-100 text-red-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };

        return (
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyles()}`}
          >
            {status === "pending" && (
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mr-1.5 animate-pulse"></span>
            )}
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "audience_size",
      header: "Customers Count",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("audience_size")}</span>
        </div>
      ),
    },
    {
      accessorKey: "sent",
      header: "Sent",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <LucideTicketCheck className="h-4 w-4 text-green-500" />
          <span>{row.getValue("sent")}</span>
        </div>
      ),
    },
    {
      accessorKey: "failed",
      header: "Failed",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Plus className="h-4 w-4 rotate-45 text-red-500" />
          <span>{row.getValue("failed")}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => console.log("Edit", row)}
            >
              <FileBarChart className="h-4 w-4" />
            </Button>
          )}
          {row.original.canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCampaignDelete(row.original._id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-5 h-full ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-gray-600 !mt-2">
            Create and manage your marketing campaigns.
          </p>
        </div>
        <Link to="/campaigns/createcampaign">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col mb-4">
          <h2 className="text-2xl font-semibold">All Campaigns</h2>
          <p className="text-gray-500">
            You have {campaigns.length} campaigns created
          </p>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-gray-500 text-lg">Loading campaigns...</p>
          </div>
        ) : (
          <TableComponent columns={columns} data={campaigns} />
        )}
      </div>
    </div>
  );
};

export default CampaignPage;
