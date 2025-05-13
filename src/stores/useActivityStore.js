import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import { BASE_URL } from "@/lib/utils";

const useActivityStore = create((set, get) => ({
  recentActions: [],
  isLoading: false,
  error: null,
  currentOrganizationId: null,

  fetchRecentActions: async () => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    const organizationId = currentOrganization._id;

    set({
      isLoading: true,
      error: null,
      currentOrganizationId: organizationId,
    });

    try {
      const response = await fetch(
        `${BASE_URL}/api/organization/recentactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            organizationId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recent actions");
      }

      const data = await response.json();

      if (get().currentOrganizationId === organizationId) {
        set({
          recentActions: data.data.actions || [],
          isLoading: false,
        });
      }

      return { success: true, activities: data.data.actions };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearActivities: () => {
    set({
      recentActions: [],
      error: null,
      currentOrganizationId: null,
    });
  },
}));

export default useActivityStore;
