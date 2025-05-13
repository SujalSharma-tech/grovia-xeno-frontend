import { SegmentRules } from "@/components/segment-rules";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/lib/utils";
import useAuthStore, { useHydration } from "@/stores/useAuthStore";
import useCampaignStore from "@/stores/useCampaignStore";
import useSegmentStore from "@/stores/useSegmentStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  Save,
  StarsIcon,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateCampaign = () => {
  const isHydrated = useHydration();
  const currentOrganization = useAuthStore(
    (state) => state.currentOrganization
  );
  const { segments, fetchSegments, isLoading } = useSegmentStore();
  const { createCampaign } = useCampaignStore();
  useEffect(() => {
    if (isHydrated && currentOrganization?._id) {
      fetchSegments();
    }
  }, [isHydrated, currentOrganization?._id, fetchSegments]);

  const [formData, setFormData] = useState({
    name: "",
    message: "",
    goal: "",
    aimessage: "",
    targetSegment: null,
  });

  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("message");
  const [showSegmentDropdown, setShowSegmentDropdown] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectSegment = (segment) => {
    setFormData((prev) => ({
      ...prev,
      targetSegment: segment,
    }));
    setShowSegmentDropdown(false);
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(`${BASE_URL}/api/ai/campaignmessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ objective: formData.aimessage }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuggestions(data.messages);
        toast.success("Suggestions generated successfully");
      } else {
        toast.error(data.error || "Failed to generate suggestions");
      }
      setIsGenerating(false);
    } catch (err) {
      console.error("Error generating suggestions:", err);
      setIsGenerating(false);
    }
  };
  const navigate = useNavigate();

  const applyThisMessage = (message) => {
    setFormData((prev) => ({
      ...prev,
      message: message,
    }));
    setActiveTab("message");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      content: formData.message,
      segment_id: formData.targetSegment?._id,
    };

    try {
      const response = await createCampaign(payload);
      if (response.success) {
        toast.success("Campaign created successfully");
        navigate("/campaigns");
      } else {
        toast.error(response.error || "Failed to create campaign");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  return (
    <div className="h-full p-5 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Create Campaign</h1>
            <p className="text-gray-600 !mt-2">
              Create a new marketing campaign to engage with your audience.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/segments">
            <Button className="border hover:bg-muted-foreground bg-transparent text-black">
              Cancel
            </Button>
          </Link>

          <Button onClick={handleSubmit}>
            {isLoading ? (
              <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            ) : (
              <Save className="h-10 w-10 text-gray-500" />
            )}
            Create Campaign
          </Button>
        </div>
      </div>

      <div className="flex">
        <div className="bg-white p-4 rounded-lg shadow w-[60%]">
          <div className="p-4 shadow-lg border rounded-lg">
            <div>
              <h2 className="text-2xl font-semibold">Campaign Details</h2>
              <p className="text-md text-gray-500">
                Basic Details about the Campaign
              </p>
            </div>

            <form className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="campaign-name" className="text-sm font-medium">
                  Campaign Name
                </label>
                <input
                  type="text"
                  id="campaign-name"
                  className="border rounded-md p-2 outline-[1px] outline-gray-100 focus:outline-gray-500"
                  placeholder="e.g., Summer Sale Announcement"
                  value={formData.name}
                  name="name"
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Campaign Goal</label>
                <textarea
                  className="border rounded-md p-2 outline-[1px] outline-gray-100 focus:outline-gray-500"
                  placeholder="e.g., Re-engage inactive users, Announce a new product"
                  name="goal"
                  rows="3"
                  value={formData.goal}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Target Audience</label>
                <div className="relative">
                  <div
                    className="border rounded-md p-2 flex justify-between items-center cursor-pointer"
                    onClick={() => setShowSegmentDropdown(!showSegmentDropdown)}
                  >
                    <span className="text-gray-500">
                      {formData.targetSegment
                        ? formData.targetSegment.title
                        : "Select a segment"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </div>

                  {showSegmentDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-md mt-1 shadow-lg z-10 max-h-80 overflow-auto">
                      {segments.map((segment) => (
                        <div
                          key={segment._id}
                          className={`p-3 hover:bg-gray-100 cursor-pointer ${
                            formData.targetSegment?._id === segment._id
                              ? "bg-gray-50"
                              : ""
                          }`}
                          onClick={() => selectSegment(segment)}
                        >
                          <div className="flex justify-between">
                            <span>{segment.title}</span>
                            <span className="text-gray-500">
                              ({segment.total_customers} customers)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
          <div className="bg-white mt-5 rounded-lg shadow">
            <div className="p-4 shadow-lg border rounded-lg bg-white">
              <p className="text-2xl font-semibold">Campaign Content</p>
              <p className="text-md text-gray-500">
                Create your campaign content.
              </p>
              <p className="text-sm text-gray-500 mt-2 ">
                {
                  "Use '${name}' template to send personalised named messages to customers"
                }
              </p>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-3"
              >
                <TabsList className="bg-gray-200">
                  <TabsTrigger
                    className="outline-none border-0"
                    value="message"
                  >
                    Message
                  </TabsTrigger>
                  <TabsTrigger
                    className="outline-none border-0"
                    value="aimessage"
                  >
                    Generate AI Message
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="message">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Campaign Message
                    </label>
                    <textarea
                      className="border rounded-md p-2 outline-[1px] outline-gray-100 focus:outline-gray-500"
                      placeholder="Enter your personalised message here e.g., Hi ${name}, we have a special offer for you!"
                      name="message"
                      value={formData.message}
                      rows="5"
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </TabsContent>
                <TabsContent value="aimessage" className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      What is the goal of this campaign?
                    </label>
                    <textarea
                      className="border rounded-md p-2 outline-[1px] outline-gray-100 focus:outline-gray-500"
                      placeholder="e.g., Win back inactive customers, Announce offers, etc"
                      name="aimessage"
                      rows="5"
                      value={formData.aimessage}
                      onChange={handleInputChange}
                    ></textarea>

                    <div
                      className={`bg-purple-600 hover:bg-purple-700 flex w-fit items-center p-3 text-white rounded-md mt-2 cursor-pointer ${
                        isGenerating ? "opacity-80" : ""
                      }`}
                      onClick={generateSuggestions}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <StarsIcon className="h-4 w-4 mr-2" />
                      )}
                      Generate Message Suggestions
                    </div>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-3">
                        AI-Generated Suggestions
                      </h3>
                      <div className="space-y-4">
                        {suggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="border rounded-lg p-4"
                          >
                            <p className="mb-3">{suggestion.content}</p>
                            <div
                              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-fit cursor-pointer mt-3"
                              onClick={() =>
                                applyThisMessage(suggestion.content)
                              }
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Use This Message
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 rounded-lg shadow">
          <div className="p-4 shadow-lg border rounded-lg bg-white">
            <div>
              <h2 className="text-2xl font-semibold">Campaign Summary</h2>
              <p className="text-md text-gray-500">Overview of the campaign</p>

              <div className="flex gap-2 mt-4 flex-col">
                <div className="border border-b-5 border-black/10 rounded-md p-2">
                  <p className="text-md font-medium">Campaign Name</p>
                  <p className="text-gray-500">
                    {formData.name || "Not specified"}
                  </p>
                </div>
                <div className="border border-b-5 border-black/10 rounded-md p-2">
                  <p className="text-md font-medium">Target Audience</p>
                  <p className="text-gray-500">
                    {formData.targetSegment
                      ? formData.targetSegment.title
                      : "Not selected"}
                  </p>
                </div>
                <div className="border border-b-5 border-black/10 rounded-md p-2">
                  <p className="text-md font-medium">Audience Size</p>
                  <p className="text-gray-500">
                    {formData.targetSegment
                      ? `${formData.targetSegment.total_customers} customers`
                      : "0 customers"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
