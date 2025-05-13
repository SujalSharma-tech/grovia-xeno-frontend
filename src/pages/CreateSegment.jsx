import { SegmentRules } from "@/components/segment-rules";
import { Button } from "@/components/ui/button";
import useSegmentStore from "@/stores/useSegmentStore";
import { ArrowLeft, Loader2, Plus, Save, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateSegment = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const { previewSegment, createSegment, isLoading, customerSize } =
    useSegmentStore();

  const navigate = useNavigate();

  const handlePreviewSegmentData = async () => {
    try {
      const payload = {
        ...formData,
        rules: segmentRules,
      };
      await previewSegment(payload);
    } catch (error) {
      console.error("Error previewing segment data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [segmentRules, setSegmentRules] = useState({
    operator: "AND",
    conditions: [
      {
        field: "lastpurchase_day",
        operator: "lessThan",
        value: 90,
      },
    ],
  });
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      rules: segmentRules,
    };
    try {
      const response = await createSegment(payload);
      if (response.success) {
        navigate("/segments");
        toast.success("Segment created successfully");
      } else {
        toast.error(
          response.error || "Failed to create segment. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating segment:", error);
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
            <h1 className="text-3xl font-bold">Create Segment</h1>
            <p className="text-gray-600 !mt-2">
              Define Rules and Conditions to create a targeted Segment.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/segments">
            <Button className="border hover:bg-muted-foreground bg-transparent text-black">
              Cancel
            </Button>
          </Link>

          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            ) : (
              <Save className="h-6 w-6 text-white" />
            )}
            Save Segment
          </Button>
        </div>
      </div>

      <div className="flex">
        <div className="bg-white p-4 rounded-lg shadow w-[60%]">
          <div className="p-4 shadow-lg border rounded-lg">
            <div>
              <h2 className="text-2xl font-semibold">Segment Details</h2>
              <p className="text-md text-gray-500">
                Basic Details about the segment
              </p>
            </div>

            <form className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="segment-name" className="text-sm font-medium">
                  Segment Name
                </label>
                <input
                  type="text"
                  className="border rounded-md p-2 outline-[1px] outline-gray-100 focus:outline-gray-500"
                  placeholder="Enter Segment Name"
                  value={formData.title}
                  name="title"
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Segment Description
                </label>
                <textarea
                  className="border rounded-md p-2 outline-[1px] outline-gray-100 focus:outline-gray-500"
                  placeholder="Enter Segment Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </form>
          </div>
        </div>

        <div className="flex-1 p-4 rounded-lg shadow">
          <div className="p-4 shadow-lg border rounded-lg bg-white">
            <div>
              <h2 className="text-2xl font-semibold">Customers Preview</h2>
              <p className="text-md text-gray-500">
                Customers matching the segment rules will be shown here.
              </p>
            </div>
            <div className="">
              <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow mt-4">
                <div className="flex items-center justify-center gap-2 ">
                  <div className="flex h-15 w-15 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl">Matching Customers</h3>
                    <p className="text-3xl font-semibold text-black">
                      {customerSize || 0}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="flex items-center justify-center gap-2 bg-gray-500/10 p-2 rounded-lg shadow mt-4 cursor-pointer w-full"
                onClick={handlePreviewSegmentData}
                disabled={isLoading}
              >
                <div className="flex items-center justify-center gap-2 bg-gray-500/10 p-2 rounded-lg shadow mt-4 cursor-pointer w-full">
                  {isLoading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
                  ) : (
                    <Users className="h-10 w-10 text-gray-500" />
                  )}
                  Refresh Customers Size
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <SegmentRules
          initialRules={segmentRules}
          onChange={(updatedRules) => setSegmentRules(updatedRules)}
        />
      </div>
    </div>
  );
};

export default CreateSegment;
