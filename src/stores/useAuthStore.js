import { BASE_URL } from "@/lib/utils";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      organizations: [],
      currentOrganization: null,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },

      fetchOrganizations: async () => {
        const { token } = get();
        if (!token) return { success: false, error: "Not authenticated" };

        try {
          const response = await fetch(
            `${BASE_URL}/api/organization/organizations`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch organizations");
          }

          const data = await response.json();

          set({
            organizations: data.organizations,
            currentOrganization:
              get().currentOrganization ||
              (data.organizations.length > 0 ? data.organizations[0] : null),
          });

          return { success: true, organizations: data.organizations };
        } catch (error) {
          console.error("Error fetching organizations:", error);
          return { success: false, error: error.message };
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${BASE_URL}/api/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
            throw new Error(errorData.message || "Login failed");
          }

          const data = await response.json();

          set({
            token: data.user.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          await get().fetchOrganizations();

          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      loginWithGoogle: async (credential) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${BASE_URL}/api/user/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Google authentication failed"
            );
          }

          const data = await response.json();

          set({
            token: data.user.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          await get().fetchOrganizations();

          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${BASE_URL}/api/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Signup failed");
          }

          const data = await response.json();

          set({
            token: data.user.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          await get().fetchOrganizations();

          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          organizations: [],
          currentOrganization: null,
        });
      },

      checkAuth: () => {
        const { token } = get();
        return !!token;
      },

      createOrganization: async (organizationData) => {
        const { token } = get();
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(
            `${BASE_URL}/api/organization/organizations`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(organizationData),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to create organization"
            );
          }

          const data = await response.json();

          set((state) => ({
            organizations: [...state.organizations, data.data],
            currentOrganization: data.data,
            isLoading: false,
          }));

          return { success: true, organization: data.data };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      switchOrganization: (organizationId) => {
        const { organizations } = get();
        const organization = organizations.find(
          (org) => org._id === organizationId
        );

        if (organization) {
          set({ currentOrganization: organization });
          return { success: true, organization };
        } else {
          return { success: false, error: "Organization not found" };
        }
      },

      deleteOrganization: async (organizationId) => {
        const { token, organizations, currentOrganization } = get();

        if (!token) {
          return { success: false, error: "Not authenticated" };
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch(
            `${BASE_URL}/api/organization/deleteorganization`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ organizationId }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to delete organization"
            );
          }

          const updatedOrganizations = organizations.filter(
            (org) => org._id !== organizationId
          );

          let updatedCurrentOrg = currentOrganization;
          if (
            currentOrganization &&
            currentOrganization._id === organizationId
          ) {
            updatedCurrentOrg =
              updatedOrganizations.length > 0 ? updatedOrganizations[0] : null;
          }

          set({
            organizations: updatedOrganizations,
            currentOrganization: updatedCurrentOrg,
            isLoading: false,
          });

          return {
            success: true,
            hasOrganizations: updatedOrganizations.length > 0,
            nextOrganization: updatedCurrentOrg,
          };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      hasActiveOrganization: () => {
        return !!get().currentOrganization;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),

      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      },
    }
  )
);

export const useHydration = () => useAuthStore((state) => state._hasHydrated);

export default useAuthStore;
