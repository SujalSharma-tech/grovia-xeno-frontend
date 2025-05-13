import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import { BASE_URL } from "@/lib/utils";

const useCampaignStore = create((set) => ({
  campaigns: [],
  isLoading: false,
  error: null,
  currentCampaign: null,
  campaignStats: null,

  fetchCampaigns: async () => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/campaign/getcampaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organizationId: currentOrganization._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch campaigns");
      }

      const data = await response.json();
      set({ campaigns: data.data, isLoading: false });

      return { success: true, campaigns: data.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  fetchCampaign: async (campaignId) => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/campaign/${campaignId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch campaign");
      }

      const data = await response.json();
      set({ currentCampaign: data.campaign, isLoading: false });

      return { success: true, campaign: data.campaign };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  createCampaign: async (campaignData) => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/campaign/createcampaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...campaignData,
          organizationId: currentOrganization._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create campaign");
      }

      const data = await response.json();

      set((state) => ({
        campaigns: [...state.campaigns, data.data.campaign],
        currentCampaign: data.campaign,
        isLoading: false,
      }));

      return { success: true, campaign: data.data.campaign };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateCampaign: async (campaignId, campaignData) => {
    const { token } = useAuthStore.getState();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update campaign");
      }

      const data = await response.json();

      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign._id === campaignId ? data.campaign : campaign
        ),
        currentCampaign: data.campaign,
        isLoading: false,
      }));

      return { success: true, campaign: data.campaign };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deleteCampaign: async (campaignId) => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/campaign/deletecampaign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          organizationId: currentOrganization._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete campaign");
      }

      set((state) => ({
        campaigns: state.campaigns.filter(
          (campaign) => campaign._id !== campaignId
        ),
        currentCampaign: null,
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearCampaignState: () => {
    set({
      currentCampaign: null,
      campaignStats: null,
      error: null,
    });
  },
}));

export default useCampaignStore;
