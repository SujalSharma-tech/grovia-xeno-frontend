import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getActivityIconConfig = (type) => {
  switch (type) {
    case "login":
      return { icon: "LogIn", color: "text-emerald-500" };
    case "invite_sent":
      return { icon: "InviteSent", color: "text-emerald-500" };
    case "logout":
      return { icon: "LogOut", color: "text-slate-500" };
    case "add_customer":
      return { icon: "UserPlus", color: "text-indigo-500" };
    case "user_invite":
      return { icon: "UserPlus", color: "text-indigo-500" };
    case "campaign_created":
      return { icon: "Users", color: "text-amber-500" };
    case "customer_import":
      return { icon: "FileText", color: "text-blue-500" };
    case "campaign_sent":
      return { icon: "Mail", color: "text-purple-500" };
    case "segment_created":
      return { icon: "MessageSquare", color: "text-teal-500" };
    case "organization_created":
      return { icon: "Settings", color: "text-gray-500" };
    case "login_failed":
      return { icon: "AlertTriangle", color: "text-red-500" };
    case "export":
      return { icon: "FileText", color: "text-blue-500" };
    case "api_access":
      return { icon: "ShoppingCart", color: "text-violet-500" };
    case "campaign_deleted":
      return { icon: "Trash2", color: "text-red-500" };
    case "segment_deleted":
      return { icon: "Trash2", color: "text-red-500" };
    default:
      return { icon: "Check", color: "text-gray-500" };
  }
};

export const getActivityBadgeConfig = (type) => {
  switch (type) {
    case "login":
      return {
        label: "Login",
        className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      };
    case "logout":
      return {
        label: "Logout",
        className: "bg-slate-100 text-slate-800 hover:bg-slate-100",
      };
    case "invite_sent":
      return {
        label: "Invite Sent",
        className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      };
    case "add_customer":
      return {
        label: "Customer Created",
        className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      };
    case "organization_created":
      return {
        label: "Organization Created",
        className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      };
    case "invite_accepted":
      return {
        label: "Invite Accepted",
        className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      };
    case "customer_update":
      return {
        label: "Customer Updated",
        className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      };
    case "customer_import":
      return {
        label: "Customer Import",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      };
    case "campaign_sent":
      return {
        label: "Campaign Sent",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      };
    case "campaign_created":
      return {
        label: "Campaign Created",
        className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      };
    case "segment_created":
      return {
        label: "Segment Created",
        className: "bg-teal-100 text-teal-800 hover:bg-teal-100",
      };
    case "settings_change":
      return {
        label: "Settings Changed",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      };
    case "campaign_deleted":
      return {
        label: "Campaign Deleted",
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      };
    case "segment_deleted":
      return {
        label: "Segment Deleted",
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      };
    default:
      return { label: "Other", className: "" };
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};
