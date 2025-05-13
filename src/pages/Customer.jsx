import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Upload,
  User,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useCustomerStore from "@/stores/useCustomerStore";
import { toast } from "sonner";

export default function AddCustomerPage() {
  const { createCustomer, importCustomers } = useCustomerStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    visit_count: "",
    totalspend: "",
    lastpurchase_day: "",
    days_inactive: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateFile = (file) => {
    if (!file) return false;

    const fileType = file.name.split(".").pop().toLowerCase();
    if (fileType !== "csv") {
      setFileError("Please upload a CSV file");
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (validateFile(selectedFile)) {
      setFileError("");
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();

    setFile(null);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length) {
      const droppedFile = droppedFiles[0];
      if (validateFile(droppedFile)) {
        setFileError("");
        setFile(droppedFile);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setFileError("Please select a file first");
      return;
    }

    setIsUploading(true);

    const resp = await importCustomers(file);
    if (!resp.success) {
      setFileError("Failed to upload file. Please try again.");
      toast.error(resp.error || "Failed to upload file. Please try again.");
      setIsUploading(false);
      return;
    } else {
      setFileError("");
      toast.success("File uploaded successfully");
      setFile(null);
      setIsUploading(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting customer data:", formData);
    const response = await createCustomer(formData);
    console.log(response);
    if (response.success) {
      console.log("Customer created successfully:", response.customer);
      toast.success("Customer created successfully");
      setFormData({
        name: "",
        email: "",
        visit_count: "",
        totalspend: "",
        lastpurchase_day: "",
        days_inactive: "",
      });
    } else {
      toast.error(response.error || "Failed to create customer");
    }
  };

  const handleDownloadTemplate = () => {
    const fileUrl = "/template/template_sample.csv";

    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", "template_sample.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Add Customers</h1>
        <p className="text-muted-foreground">
          Add new customers to your CRM individually or in bulk.
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="single">
            <User className="mr-2 h-4 w-4" />
            Add Single Customer
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Bulk Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-0">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Enter the details for the new customer. Fields marked with * are
                required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="customer-form" onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Separator />

                  {/* Customer metrics fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visit_count">Visit Count</Label>
                      <Input
                        id="visit_count"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.visit_count}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalspend">Total Spend ($)</Label>
                      <Input
                        id="totalspend"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.totalspend}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastpurchase_day">
                        Last Purchase (days ago)
                      </Label>
                      <Input
                        id="lastpurchase_day"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.lastpurchase_day}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="days_inactive">Days Inactive</Label>
                      <Input
                        id="days_inactive"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.days_inactive}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-slate-50 p-6">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" form="customer-form">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="mt-0">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Bulk Import Customers</CardTitle>
              <CardDescription>
                Upload a CSV or Excel file with customer data to import multiple
                customers at once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">File Format</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Your file should include columns for: name, email,
                    visit_count, totalspend, lastpurchase_day, days_inactive
                    <div className="mt-2">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-blue-600"
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Download template
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>

                <div
                  ref={dropzoneRef}
                  tabIndex={0}
                  className={`border-2 border-dashed rounded-lg p-10 text-center bg-slate-50 
                    ${isDragging ? "border-blue-500 bg-blue-50" : ""} 
                    ${isFocused ? "border-blue-400 ring-2 ring-blue-300" : ""}
                    transition-all duration-200 outline-none
                    hover:border-blue-300 hover:bg-blue-50/50`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onClick={handleDropzoneClick}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="rounded-full bg-slate-100 p-4">
                      <Upload className="h-8 w-8 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">
                        Drag and drop your file here
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports CSV and Excel files
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        id="file-upload"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Stop event from bubbling to parent
                          fileInputRef.current?.click();
                        }}
                        className="focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select File
                      </Button>
                    </div>

                    {/* File selected state with remove option */}
                    {file && (
                      <div className="flex items-center justify-between w-full max-w-md p-2 mt-2 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                          <FileSpreadsheet className="h-4 w-4" />
                          {file.name}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveFile(e)}
                          className="p-1 rounded-full hover:bg-green-100 text-green-700"
                          title="Remove file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {fileError && (
                      <div className="text-sm font-medium text-red-600">
                        {fileError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-slate-50 p-6">
              <Button variant="outline" onClick={() => setFile(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
