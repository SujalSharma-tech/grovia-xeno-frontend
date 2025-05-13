import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import useActivityStore from "@/stores/useActivityStore";
import useAuthStore, { useHydration } from "@/stores/useAuthStore";
import useDashboardStore from "@/stores/useDashboardStore";
import {
  ArrowRight,
  BarChart3Icon,
  Check,
  CircleDotDashedIcon,
  Import,
  Loader2,
  Mail,
  MessageSquareHeartIcon,
  Plus,
  Users,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const currentOrganization = useAuthStore(
    (state) => state.currentOrganization
  );
  const isHydrated = useHydration();
  const { stats, isLoading, error, fetchDashboardStats } = useDashboardStore();
  const { fetchRecentActions, recentActions } = useActivityStore();

  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightStatus, setInsightStatus] = useState(null);
  const pollingIntervalRef = useRef(null);
  const [insightId, setInsightId] = useState(null);

  useEffect(() => {
    if (isHydrated && currentOrganization?._id) {
      fetchDashboardStats();
      fetchRecentActions();
    } else if (isHydrated && !currentOrganization) {
      console.log("No organization available after hydration");
    }
  }, [
    isHydrated,
    currentOrganization?._id,
    fetchDashboardStats,
    fetchRecentActions,
    currentOrganization,
  ]);

  useEffect(() => {
    if (!isLoading && !stats && !error && currentOrganization?.id) {
      fetchDashboardStats();
    }
  }, [isLoading, stats, error, currentOrganization?.id, fetchDashboardStats]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const fetchAiInsights = async () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsLoadingInsights(true);
    setAiInsights(null);
    setInsightStatus("PENDING");
    setInsightId(null);

    try {
      const response = await fetch(`${BASE_URL}/api/ai/campaigninsights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          organizationId: currentOrganization._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching AI insights:", errorData.message);
        toast.error("Error Fetching AI insights");
        setIsLoadingInsights(false);
        setInsightStatus(null);
        return;
      }

      const data = await response.json();
      console.log("AI Insights Data:", data);
      const recievedId = data.data._id;
      setInsightId(recievedId);

      if (data.data.status === "COMPLETED") {
        setAiInsights(data.data.content);
        setInsightStatus("COMPLETED");
        setIsLoadingInsights(false);
      } else {
        startPolling(recievedId);
      }
    } catch (error) {
      console.error("Error initiating insights:", error);
      setIsLoadingInsights(false);
      setInsightStatus(null);
    }
  };

  const checkInsightsStatus = async (insightId) => {
    if (!insightId) {
      console.error("No insight ID available for status check");
      clearInterval(pollingIntervalRef.current);
      setIsLoadingInsights(false);
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/api/ai/campaigninsights/status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ insightId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check insights status");
      }

      const data = await response.json();
      console.log("Insight status check:", data);

      if (data.data.status === "COMPLETED") {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setAiInsights(data.data.content);
        setInsightStatus("COMPLETED");
        setIsLoadingInsights(false);
      }
    } catch (error) {
      console.error("Error checking insight status:", error);
    }
  };

  const startPolling = (id) => {
    const currInsightid = id || insightId;
    if (!currInsightid) {
      console.error("No insight ID available for polling");
      setIsLoadingInsights(false);
      return;
    }

    checkInsightsStatus(currInsightid);
    pollingIntervalRef.current = setInterval(() => {
      checkInsightsStatus(currInsightid);
    }, 5000);
  };

  const clearInsights = () => {
    setAiInsights(null);
    setInsightStatus(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  return (
    <div className="p-5 h-full ">
      <span className="text-3xl font-bold">Dashboard</span>
      <p className="mt-4 text-lg text-gray-600">
        Welcome Back{" "}
        <span className="font-medium text-black">{user?.name || "User"}</span>,
        here is an overview of{" "}
        {currentOrganization?.name || "your organization"}
      </p>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading dashboard data...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">Failed to load dashboard data: {error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-2 text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {(aiInsights || insightStatus === "PENDING") && (
        <div className="mb-6 mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4 relative">
          <button
            onClick={clearInsights}
            className="absolute top-3 right-3 text-purple-500 hover:text-purple-700"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center mb-2">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-purple-800">
              AI Business Insights
            </h3>
          </div>

          {insightStatus === "PENDING" && !aiInsights ? (
            <div className="py-4 flex items-center">
              <Loader2 className="h-4 w-4 text-purple-600 animate-spin mr-2" />
              <p className="text-purple-700">
                Your insights will be available here shortly...
              </p>
            </div>
          ) : (
            <p className="text-purple-700">{aiInsights}</p>
          )}
        </div>
      )}

      {!isLoading && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
            <StatsCard
              title="Total Customers"
              value={stats.totalCustomers || 0}
              icon={<Users className="h-5 w-5" />}
              color="blue"
            />
            <StatsCard
              title="Active Campaigns"
              value={stats.totalCampaigns || 0}
              icon={<MessageSquareHeartIcon className="h-5 w-5" />}
              color="green"
            />
            <StatsCard
              title="Customer Segments"
              value={stats.totalSegments || 0}
              icon={<CircleDotDashedIcon className="h-5 w-5" />}
              color="purple"
            />
            <StatsCard
              title="Campaign Success Rate"
              value={`${stats.successRate || 0}%`}
              icon={<BarChart3Icon className="h-5 w-5" />}
              color="amber"
            />
          </div>
        </>
      )}

      <div className="flex gap-5">
        <div className="mt-8 w-[40%] bg-white shadow-lg rounded-lg p-4 border">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <p className="text-gray-600 mt-2">Some Tasks you can do quickly</p>
          <div className="flex flex-col gap-4 mt-4">
            <Link to={"/segments/createsegment"}>
              <div className="text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition duration-200 text-start bg-blue-500 cursor-pointer flex items-center gap-2">
                <span>Create new Segment</span>
                <Plus className="h-4 w-4 ml-auto" />
              </div>
            </Link>
            <Link to={"/campaigns/createcampaign"}>
              <div className="text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition duration-200 text-start bg-blue-500 cursor-pointer flex items-center gap-2">
                <span>Create new Campaign</span>
                <Plus className="h-4 w-4 ml-auto" />
              </div>
            </Link>
            <button disabled={isLoadingInsights} className="w-full">
              <div
                onClick={fetchAiInsights}
                className="text-white py-2 px-4 rounded-md shadow-md hover:bg-purple-600 transition duration-200 text-start bg-purple-500 cursor-pointer flex items-center gap-2"
              >
                {isLoadingInsights ? (
                  <>
                    <span>Generating Insights...</span>
                    <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                  </>
                ) : (
                  <>
                    <span>Get AI Business Insights</span>
                    <Sparkles className="h-4 w-4 ml-auto" />
                  </>
                )}
              </div>
            </button>

            <Link to={"/team"}>
              <div className="text-black py-2 px-4 rounded-md border hover:bg-gray-200 transition duration-200 text-start bg-white cursor-pointer flex items-center gap-2">
                <span>Team Management</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-8 w-[40%] bg-white shadow-lg border rounded-lg p-4 flex-1">
          <div className="flex items-center justify-between ">
            <h2 className="text-xl font-semibold">Action Center</h2>
            <Link to={"/actioncenter"}>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                View All
              </button>
            </Link>
          </div>
          <p className="text-gray-600 mt-2">Some of your recent actions</p>
          <div className="flex flex-col gap-2 mt-4">
            {recentActions.slice(0, 3).map((action) => (
              <div
                className="flex items-center gap-2 p-2 rounded-md"
                key={action._id}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  {action.type === "campaign_created" ? (
                    <MessageSquareHeartIcon className="h-6 w-6 text-primary" />
                  ) : action.type === "segment_created" ? (
                    <Users className="h-6 w-6 text-primary" />
                  ) : action.type === "customer_imported" ? (
                    <Import className="h-6 w-6 text-primary" />
                  ) : action.type === "campaign_sent" ? (
                    <Mail className="h-6 w-6 text-primary" />
                  ) : (
                    <Check className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-semibold">{action.title}</span>
                  <p className="text-sm text-gray-500">{action.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(action.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, color }) => {
  const bgColor = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
  }[color];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center mb-3">
        <div className={`rounded-full p-2 ${bgColor}`}>{icon}</div>
      </div>
      <h3 className="text-lg font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default Dashboard;
