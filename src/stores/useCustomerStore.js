import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import { BASE_URL } from "@/lib/utils";

const useCustomerStore = create((set, get) => ({
  customers: [],
  isLoading: false,
  error: null,
  currentCustomer: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  filters: {
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  importStatus: {
    isImporting: false,
    progress: 0,
    success: false,
    error: null,
  },

  createCustomer: async (customerData) => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/api/customer/insertcustomer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...customerData,
          organizationId: currentOrganization._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create customer");
      }

      const data = await response.json();

      if (get().pagination.page === 1) {
        set((state) => ({
          customers: [data.data.customer, ...state.customers].slice(
            0,
            state.pagination.limit
          ),
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1,
          },
          isLoading: false,
        }));
      } else {
        set((state) => ({
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1,
          },
          isLoading: false,
        }));
      }

      return { success: true, customer: data.data.customer };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  importCustomers: async (file) => {
    const { token, currentOrganization } = useAuthStore.getState();

    if (!token || !currentOrganization) {
      return { success: false, error: "No active organization" };
    }

    set({
      importStatus: {
        isImporting: true,
        progress: 0,
        success: false,
        error: null,
      },
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("organizationId", currentOrganization._id);

      const response = await fetch(`${BASE_URL}/api/customer/csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to import customers");
      }

      const data = await response.json();

      set({
        importStatus: {
          isImporting: false,
          progress: 100,
          success: true,
          error: null,
        },
      });

      return {
        success: true,
        imported: data.imported,
        failed: data.failed,
      };
    } catch (error) {
      set({
        importStatus: {
          isImporting: false,
          progress: 0,
          success: false,
          error: error.message,
        },
      });
      return { success: false, error: error.message };
    }
  },

  clearCustomerState: () => {
    set({
      currentCustomer: null,
      error: null,
    });
  },

  resetImportStatus: () => {
    set({
      importStatus: {
        isImporting: false,
        progress: 0,
        success: false,
        error: null,
      },
    });
  },
}));

export default useCustomerStore;
