import { TableComponent } from "@/components/segment-table";
import { Button } from "@/components/ui/button";
import useAuthStore, { useHydration } from "@/stores/useAuthStore";
import useSegmentStore from "@/stores/useSegmentStore";
import { Edit, Trash, Users, Plus, FileBarChart, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SegmentPage = () => {
  const isHydrated = useHydration();
  const currentOrganization = useAuthStore(
    (state) => state.currentOrganization
  );
  const { fetchSegments, segments, deleteSegment, isLoading } =
    useSegmentStore();

  useEffect(() => {
    if (isHydrated && currentOrganization?._id) {
      fetchSegments();
    }
  }, [isHydrated, currentOrganization?._id, fetchSegments]);

  const handleDeleteSegment = async (id) => {
    try {
      const response = await deleteSegment(id);
      if (response.success) {
        toast.success("Segment deleted successfully");
      } else {
        toast.error(response.error || "Failed to delete segment");
      }
    } catch (error) {
      console.error("Error deleting segment:", error);
    }
  };

  const columns = [
    {
      accessorKey: "title",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "total_customers",
      header: "Customers Count",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("total_customers")}</span>
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        return new Date(row.getValue("updatedAt")).toLocaleDateString();
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
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {row.original.canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteSegment(row.original._id)}
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
          <h1 className="text-3xl font-bold">Segments</h1>
          <p className="text-gray-600 !mt-2">
            Create and Manage your Segments for better targeting.
          </p>
        </div>
        <Link to="/segments/createsegment">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Segment
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col mb-4">
          <h2 className="text-2xl font-semibold">All Segments</h2>
          <p className="text-gray-500">
            You have {segments.length} segments defined
          </p>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-gray-500 text-lg">Loading segments...</p>
          </div>
        ) : (
          <TableComponent columns={columns} data={segments} />
        )}
      </div>
    </div>
  );
};

export default SegmentPage;
