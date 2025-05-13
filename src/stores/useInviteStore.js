import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import { BASE_URL } from "@/lib/utils";

const useInviteStore = create((set) => ({
  invites: [],
  isLoading: false,
  isInviteLoading: false,
  error: null,
  organizationData: null,

  fetchMembers: async () => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/organization/members`, {
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
        throw new Error(errorData.message || "Failed to fetch members");
      }

      const data = await response.json();
      set({ organizationData: data.data || {}, isLoading: false });

      return { success: true, organizationData: data.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  fetchUserInvites: async () => {
    const { token } = useAuthStore.getState();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    set({ isInviteLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/invite/invites/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch invites");
      }

      const data = await response.json();
      set({ invites: data.data || [], isInviteLoading: false });

      return { success: true, invites: data.data };
    } catch (error) {
      set({ error: error.message, isInviteLoading: false });
      return { success: false, error: error.message };
    }
  },

  sendInvite: async (email, role) => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({ isInviteLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/invite/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          role,
          organizationId: currentOrganization._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send invite");
      }

      const data = await response.json();
      set({ isInviteLoading: false });

      return { success: true, invite: data.data };
    } catch (error) {
      set({ error: error.message, isInviteLoading: false });
      return { success: false, error: error.message };
    }
  },

  acceptInvite: async (inviteId) => {
    const { token } = useAuthStore.getState();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    set({ isInviteLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/invite/invites/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept invite");
      }

      set((state) => ({
        invites: state.invites.filter((invite) => invite._id !== inviteId),
        isInviteLoading: false,
      }));

      await useAuthStore.getState().fetchOrganizations();

      return { success: true };
    } catch (error) {
      set({ error: error.message, isInviteLoading: false });
      return { success: false, error: error.message };
    }
  },

  rejectInvite: async (inviteId) => {
    const { token } = useAuthStore.getState();

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    set({ isInviteLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/invite/invites/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject invite");
      }

      set((state) => ({
        invites: state.invites.filter((invite) => invite._id !== inviteId),
        isInviteLoading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, isInviteLoading: false });
      return { success: false, error: error.message };
    }
  },
}));

export default useInviteStore;
