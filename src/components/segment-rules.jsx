import React, { useState, useEffect } from "react";
import {
  Trash2,
  ChevronDown,
  Plus,
  Users,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { BASE_URL } from "@/lib/utils";

const FIELD_OPTIONS = [
  { id: "lastpurchase_day", label: "Days Since Last Purchase" },
  { id: "visit_count", label: "Visit Count" },
  { id: "totalspend", label: "Total Spend" },
  { id: "days_inactive", label: "Days Inactive" },
];

const OPERATOR_OPTIONS = [
  { id: "lessThan", label: "Less Than" },
  { id: "lessThanOrEqual", label: "Less Than or Equal" },
  { id: "equal", label: "Equal To" },
  { id: "greaterThan", label: "Greater Than" },
  { id: "greaterThanOrEqual", label: "Greater Than or Equal" },
];

const LOGIC_OPERATORS = [
  { id: "AND", label: "AND" },
  { id: "OR", label: "OR" },
];

function Condition({ condition, path, onUpdate, onRemove }) {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex gap-2 items-center">
        <Select
          value={condition.field}
          onValueChange={(value) => onUpdate(path, "field", value)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {FIELD_OPTIONS.map((field) => (
              <SelectItem key={field.id} value={field.id}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={condition.operator}
          onValueChange={(value) => onUpdate(path, "operator", value)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {OPERATOR_OPTIONS.map((op) => (
              <SelectItem key={op.id} value={op.id}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          className="flex-1"
          value={condition.value.toString()}
          onChange={(e) => {
            const inputValue = e.target.value;

            if (inputValue === "") {
              onUpdate(path, "value", 0);
            } else {
              const numValue = parseInt(inputValue, 10);
              onUpdate(path, "value", isNaN(numValue) ? 0 : numValue);
            }
          }}
        />

        <Button variant="ghost" size="icon" onClick={() => onRemove(path)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ConditionGroup({ group, path, onUpdate, onRemove }) {
  const isRootGroup = path.length === 0;

  return (
    <div
      className={`border rounded-lg p-4 space-y-4 ${
        isRootGroup ? "" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <ChevronDown className="text-gray-500" />
        <span className="text-sm font-medium">
          {group.conditions.length}{" "}
          {group.conditions.length === 1 ? "rule" : "rules"}
        </span>

        <Select
          value={group.operator}
          onValueChange={(value) => onUpdate(path, "operator", value)}
        >
          <SelectTrigger className="w-20">
            <SelectValue>{group.operator}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LOGIC_OPERATORS.map((op) => (
              <SelectItem key={op.id} value={op.id}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-gray-500">All conditions must match</span>

        {!isRootGroup && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => onRemove(path)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {group.conditions.map((condition, index) => {
          const currentPath = [...path, "conditions", index];
          const isGroup = condition.conditions && condition.operator;

          return isGroup ? (
            <ConditionGroup
              key={index}
              group={condition}
              path={currentPath}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ) : (
            <Condition
              key={index}
              condition={condition}
              path={currentPath}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() =>
            onUpdate([...path, "conditions"], "add", {
              field: "lastpurchase_day",
              operator: "lessThan",
              value: 90,
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add Condition
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() =>
            onUpdate([...path, "conditions"], "addGroup", {
              operator: "AND",
              conditions: [
                {
                  field: "lastpurchase_day",
                  operator: "lessThan",
                  value: 30,
                },
              ],
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add Group
        </Button>
      </div>
    </div>
  );
}

export function SegmentRules({ initialRules, onChange }) {
  const defaultRule = {
    operator: "AND",
    conditions: [
      {
        field: "lastpurchase_day",
        operator: "lessThan",
        value: 90,
      },
    ],
  };

  const [rules, setRules] = useState(initialRules || defaultRule);
  const [activeTab, setActiveTab] = useState("builder");
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);

  useEffect(() => {
    onChange?.(rules);
  }, [rules, onChange]);

  const handleUpdate = (path, action, value) => {
    if (isSelectAll) {
      setIsSelectAll(false);
    }

    if (path.length === 0) {
      if (action === "operator") {
        setRules({ ...rules, operator: value });
      }
      return;
    }

    function updateAtPath(obj, path, action, value, currentIndex = 0) {
      if (currentIndex >= path.length) return obj;

      const key = path[currentIndex];
      const isLastKey = currentIndex === path.length - 1;

      if (key === "conditions") {
        if (isLastKey) {
          if (action === "add") {
            return {
              ...obj,
              conditions: [...obj.conditions, value],
            };
          }
          if (action === "addGroup") {
            return {
              ...obj,
              conditions: [...obj.conditions, value],
            };
          }
        }

        const nextKey = path[currentIndex + 1];
        if (typeof nextKey === "number") {
          const newConditions = [...obj.conditions];

          if (currentIndex + 1 === path.length - 1) {
            if (action === "remove") {
              return {
                ...obj,
                conditions: obj.conditions.filter((_, i) => i !== nextKey),
              };
            }
            if (["field", "operator", "value"].includes(action)) {
              newConditions[nextKey] = {
                ...newConditions[nextKey],
                [action]: value,
              };
              return { ...obj, conditions: newConditions };
            }
          }

          newConditions[nextKey] = updateAtPath(
            newConditions[nextKey],
            path,
            action,
            value,
            currentIndex + 2
          );
          return { ...obj, conditions: newConditions };
        }
      }

      const newObj = { ...obj };
      newObj[key] = updateAtPath(
        obj[key],
        path,
        action,
        value,
        currentIndex + 1
      );
      return newObj;
    }

    setRules(updateAtPath({ ...rules }, path, action, value));
  };

  const handleSelectAllCustomers = () => {
    const selectAllRule = {
      operator: "OR",
      conditions: [
        {
          field: "totalspend",
          operator: "greaterThanOrEqual",
          value: 0,
        },
      ],
      selectAll: true,
    };

    setRules(selectAllRule);
    setIsSelectAll(true);
  };

  const handleProcessNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) {
      setProcessingError("Please enter a description of your target audience");
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/ai/segmentrules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prompt: naturalLanguageInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to process natural language query");
      }

      const data = await response.json();
      setRules(data.rules);
      setActiveTab("builder");
      setIsSelectAll(false);
    } catch (error) {
      console.error("Error processing natural language:", error);
      setProcessingError(
        error.message || "An error occurred while processing your request"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Segment Rules</h2>
          <p className="text-gray-500 text-sm">
            Define the rules that determine which customers are included in this
            segment.
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleSelectAllCustomers}
        >
          <Users size={16} />
          Select All Customers
        </Button>
      </div>

      {isSelectAll && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <Users className="text-blue-500" size={18} />
          <div className="flex-1">
            <p className="text-blue-700 font-medium">All customers selected</p>
            <p className="text-blue-600 text-sm">
              This segment will include all customers in your database.
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-200"
          >
            Maximum Reach
          </Badge>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 bg-gray-200 p-1 rounded-lg">
          <TabsTrigger value="builder" className="outline-none border-0">
            Rule Builder
          </TabsTrigger>
          <TabsTrigger value="natural" className="outline-none border-0">
            Natural Language
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="p-0">
          <ConditionGroup
            group={rules}
            path={[]}
            onUpdate={handleUpdate}
            onRemove={(path) => handleUpdate(path, "remove")}
          />
        </TabsContent>

        <TabsContent value="natural" className="p-0">
          <div className="border rounded-lg p-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">
                Describe your target audience in plain English
              </p>
              <Textarea
                className="min-h-[100px] w-full"
                placeholder="For example: Customers who spent more than $100 in the last 30 days and visited our website at least twice"
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
              />
            </div>

            <Button
              className="flex items-center gap-2"
              onClick={handleProcessNaturalLanguage}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Rules
                </>
              )}
            </Button>

            {processingError && (
              <Alert variant="destructive">
                <AlertDescription>{processingError}</AlertDescription>
              </Alert>
            )}

            {/* Success message when rules were successfully applied */}
            {activeTab === "natural" &&
              isProcessing === false &&
              !processingError &&
              rules &&
              rules !== initialRules && (
                <Alert
                  variant="success"
                  className="bg-green-50 border-green-200 text-green-800"
                >
                  <AlertDescription className="flex items-center">
                    <span className="text-green-600">
                      Rules successfully generated and applied! Switch to the
                      Rule Builder tab to view.
                    </span>
                  </AlertDescription>
                </Alert>
              )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
