import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import { BASE_URL } from "@/lib/utils";

const useSegmentStore = create((set) => ({
  segments: [],
  isLoading: false,
  error: null,
  currentSegment: null,
  segmentMetrics: null,
  customerSize: 0,

  fetchSegments: async () => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/segment/getsegments`, {
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
        throw new Error(errorData.message || "Failed to fetch segments");
      }

      const data = await response.json();
      set({ segments: data.data, isLoading: false });

      return { success: true, segments: data.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  fetchSegment: async (segmentId) => {
    const { token } = useAuthStore.getState();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/segments/${segmentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch segment");
      }

      const data = await response.json();
      set({ currentSegment: data.segment, isLoading: false });

      return { success: true, segment: data.segment };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  createSegment: async (segmentData) => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/segment/createsegment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...segmentData,
          organizationId: currentOrganization._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create segment");
      }

      const data = await response.json();

      set((state) => ({
        segments: [...state.segments, data.data],
        currentSegment: data.data,
        isLoading: false,
      }));

      return { success: true, segment: data.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },
  previewSegment: async (segmentData) => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${BASE_URL}/api/segment/createsegment/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...segmentData,
            organizationId: currentOrganization._id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create segment");
      }

      const data = await response.json();

      set({
        customerSize: data.data.customers,
        isLoading: false,
      });

      return { success: true, customerSize: data.data.customers };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateSegment: async (segmentId, segmentData) => {
    const { token } = useAuthStore.getState();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/segments/${segmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(segmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update segment");
      }

      const data = await response.json();

      set((state) => ({
        segments: state.segments.map((segment) =>
          segment._id === segmentId ? data.segment : segment
        ),
        currentSegment: data.segment,
        isLoading: false,
      }));

      return { success: true, segment: data.segment };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deleteSegment: async (segmentId) => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/segment/deletesegment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segmentId,
          organizationId: currentOrganization._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete segment");
      }

      set((state) => ({
        segments: state.segments.filter((segment) => segment._id !== segmentId),
        currentSegment: null,
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearSegmentState: () => {
    set({
      currentSegment: null,
      segmentMetrics: null,
      error: null,
    });
  },
}));

export default useSegmentStore;
